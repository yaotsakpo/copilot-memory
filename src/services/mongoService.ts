import * as mongoose from 'mongoose';
import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

/**
 * Configuration options for MongoDB connection
 */
export interface MongoConnectionConfig {
    uri: string;
    maxPoolSize?: number;
    minPoolSize?: number;
    maxConnecting?: number;
    connectTimeoutMS?: number;
    serverSelectionTimeoutMS?: number;
    heartbeatFrequencyMS?: number;
    retryWrites?: boolean;
    retryReads?: boolean;
    bufferMaxEntries?: number;
    bufferCommands?: boolean;
}

/**
 * Retry configuration for connection attempts
 */
export interface RetryConfig {
    maxRetries: number;
    retryDelayMs: number;
    exponentialBackoff: boolean;
}

/**
 * MongoDB connection service with pooling and retry logic
 */
export class MongoService {
    private static instance: MongoService | null = null;
    private connection: mongoose.Connection | null = null;
    private isConnecting = false;
    private connectionPromise: Promise<mongoose.Connection> | null = null;
    private retryConfig: RetryConfig;
    private connectionConfig: MongoConnectionConfig;

    private constructor(config: MongoConnectionConfig, retryConfig: RetryConfig = {
        maxRetries: 3,
        retryDelayMs: 1000,
        exponentialBackoff: true
    }) {
        this.connectionConfig = {
            maxPoolSize: 10,
            minPoolSize: 2,
            maxConnecting: 2,
            connectTimeoutMS: 10000,
            serverSelectionTimeoutMS: 5000,
            heartbeatFrequencyMS: 10000,
            retryWrites: true,
            retryReads: true,
            bufferMaxEntries: 0,
            bufferCommands: false,
            ...config
        };
        this.retryConfig = retryConfig;
    }

    /**
     * Get singleton instance of MongoService
     */
    public static getInstance(config?: MongoConnectionConfig, retryConfig?: RetryConfig): MongoService {
        if (!MongoService.instance) {
            if (!config) {
                throw new Error('MongoService config is required for first initialization');
            }
            MongoService.instance = new MongoService(config, retryConfig);
        }
        return MongoService.instance;
    }

    /**
     * Connect to MongoDB with retry logic
     */
    public async connect(): Promise<mongoose.Connection> {
        if (this.connection && this.connection.readyState === 1) {
            return this.connection;
        }

        if (this.isConnecting && this.connectionPromise) {
            return this.connectionPromise;
        }

        this.isConnecting = true;
        this.connectionPromise = this.connectWithRetry();

        try {
            this.connection = await this.connectionPromise;
            return this.connection;
        } finally {
            this.isConnecting = false;
            this.connectionPromise = null;
        }
    }

    /**
     * Get current connection if available
     */
    public getConnection(): mongoose.Connection | null {
        if (this.connection && this.connection.readyState === 1) {
            return this.connection;
        }
        return null;
    }

    /**
     * Check if connected to MongoDB
     */
    public isConnected(): boolean {
        return this.connection !== null && this.connection.readyState === 1;
    }

    /**
     * Disconnect from MongoDB
     */
    public async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                Logger.info('Closing MongoDB connection...');
                await this.connection.close();
                this.connection = null;
                Logger.info('MongoDB connection closed');
            } catch (error) {
                Logger.error('Error closing MongoDB connection', error as Error);
            }
        }
    }

    /**
     * Get connection statistics
     */
    public getConnectionStats(): {
        isConnected: boolean;
        readyState: string;
        poolSize?: number;
        activeConnections?: number;
    } {
        if (!this.connection) {
            return {
                isConnected: false,
                readyState: 'disconnected'
            };
        }

        const readyStates: Record<number, string> = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        return {
            isConnected: this.connection.readyState === 1,
            readyState: readyStates[this.connection.readyState as keyof typeof readyStates] || 'unknown',
            // Note: Mongoose doesn't expose pool statistics directly
            // These would need to be tracked separately if needed
        };
    }

    /**
     * Connect with retry logic
     */
    private async connectWithRetry(): Promise<mongoose.Connection> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                Logger.info(`Attempting MongoDB connection (attempt ${attempt}/${this.retryConfig.maxRetries})`);

                const connection = await mongoose.createConnection(this.connectionConfig.uri, {
                    maxPoolSize: this.connectionConfig.maxPoolSize,
                    minPoolSize: this.connectionConfig.minPoolSize,
                    maxConnecting: this.connectionConfig.maxConnecting,
                    connectTimeoutMS: this.connectionConfig.connectTimeoutMS,
                    serverSelectionTimeoutMS: this.connectionConfig.serverSelectionTimeoutMS,
                    heartbeatFrequencyMS: this.connectionConfig.heartbeatFrequencyMS,
                    retryWrites: this.connectionConfig.retryWrites,
                    retryReads: this.connectionConfig.retryReads,
                    // bufferMaxEntries and bufferCommands are handled by mongoose internally
                });

                // Set up connection event handlers
                this.setupConnectionEventHandlers(connection);

                // Wait for connection to be ready
                await this.waitForConnection(connection);

                Logger.info('Successfully connected to MongoDB');
                return connection;

            } catch (error) {
                lastError = error as Error;
                Logger.warn(`MongoDB connection attempt ${attempt} failed: ${lastError.message}`);

                if (attempt < this.retryConfig.maxRetries) {
                    const delayMs = this.calculateRetryDelay(attempt);
                    Logger.info(`Retrying in ${delayMs}ms...`);
                    await this.sleep(delayMs);
                }
            }
        }

        const errorMessage = `Failed to connect to MongoDB after ${this.retryConfig.maxRetries} attempts. Last error: ${lastError?.message}`;
        Logger.error(errorMessage, lastError || undefined);
        throw new Error(errorMessage);
    }

    /**
     * Set up connection event handlers
     */
    private setupConnectionEventHandlers(connection: mongoose.Connection): void {
        connection.on('connected', () => {
            Logger.info('MongoDB connection established');
        });

        connection.on('error', (error) => {
            Logger.error('MongoDB connection error', error);
        });

        connection.on('disconnected', () => {
            Logger.warn('MongoDB connection lost');
        });

        connection.on('reconnected', () => {
            Logger.info('MongoDB reconnected');
        });

        connection.on('close', () => {
            Logger.info('MongoDB connection closed');
        });
    }

    /**
     * Wait for connection to be ready
     */
    private async waitForConnection(connection: mongoose.Connection): Promise<void> {
        return new Promise((resolve, reject) => {
            if (connection.readyState === 1) {
                resolve();
                return;
            }

            const timeout = setTimeout(() => {
                reject(new Error('Connection timeout'));
            }, this.connectionConfig.connectTimeoutMS);

            connection.once('connected', () => {
                clearTimeout(timeout);
                resolve();
            });

            connection.once('error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    /**
     * Calculate retry delay with optional exponential backoff
     */
    private calculateRetryDelay(attempt: number): number {
        if (this.retryConfig.exponentialBackoff) {
            return this.retryConfig.retryDelayMs * Math.pow(2, attempt - 1);
        }
        return this.retryConfig.retryDelayMs;
    }

    /**
     * Sleep utility function
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Reset singleton instance (for testing)
     */
    public static resetInstance(): void {
        if (MongoService.instance) {
            MongoService.instance.disconnect();
            MongoService.instance = null;
        }
    }
}
