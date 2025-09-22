import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';
import { MongoService, MongoConnectionConfig } from './services/mongoService';
import { createRuleModel, IRuleDocument } from './models/ruleSchema';
import { Logger } from './utils/logger';
import { ConfigValidator } from './utils/configValidator';

export interface Rule {
    ruleId: string;
    ruleText: string;
    scope: 'global' | 'project' | 'language';
    languageScope?: string;
    projectPath?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export class RuleManager {
    private context: vscode.ExtensionContext;
    private mongoService: MongoService | null = null;
    private ruleModel: mongoose.Model<IRuleDocument> | null = null;
    private localFilePath: string;
    private rules: Rule[] = [];
    private fallbackToLocal: boolean;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.localFilePath = path.join(
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || context.globalStorageUri.fsPath,
            '.copilot-memory.json'
        );

        // Get configuration settings
        const config = vscode.workspace.getConfiguration('copilotMemory');
        this.fallbackToLocal = config.get<boolean>('fallbackToLocal', true);
    }

    async initialize(): Promise<void> {
        Logger.info('RuleManager initializing...');
        const config = ConfigValidator.getSafeConfig();
        const mongoUri = config.mongodbUri;

        // Try to connect to MongoDB first
        if (mongoUri && mongoUri !== 'mongodb://localhost:27017/copilot-memory') {
            try {
                await this.connectToMongoDB(mongoUri);
                Logger.info('Connected to MongoDB');
            } catch (error) {
                Logger.error('Failed to connect to MongoDB', error as Error);
                if (!this.fallbackToLocal) {
                    throw new Error('MongoDB connection failed and fallback is disabled');
                }
            }
        } else {
            Logger.info('Skipping MongoDB connection (using default/test URI)');
        }

        // Load rules from appropriate source
        if (this.mongoService?.isConnected()) {
            await this.loadRulesFromMongo();
        } else {
            await this.loadRulesFromLocal();
        }
    }

    private async connectToMongoDB(uri: string): Promise<void> {
        try {
            Logger.info('Connecting to MongoDB...');

            const connectionConfig: MongoConnectionConfig = {
                uri,
                maxPoolSize: 10,
                minPoolSize: 2,
                maxConnecting: 2,
                connectTimeoutMS: 10000,
                serverSelectionTimeoutMS: 5000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                retryReads: true
            };

            this.mongoService = MongoService.getInstance(connectionConfig, {
                maxRetries: 3,
                retryDelayMs: 1000,
                exponentialBackoff: true
            });

            const connection = await this.mongoService.connect();
            this.ruleModel = createRuleModel(connection);

            Logger.info('Connected to MongoDB successfully');
        } catch (error) {
            Logger.error('MongoDB connection failed', error as Error);
            throw error;
        }
    }

    private async loadRulesFromMongo(): Promise<void> {
        try {
            if (!this.ruleModel) {
                throw new Error('MongoDB model not initialized');
            }

            Logger.info('Loading rules from MongoDB...');
            const mongoRules = await this.ruleModel.find({ isActive: true }).sort({ createdAt: -1 });

            this.rules = mongoRules.map(rule => ({
                ruleId: rule.ruleId,
                ruleText: rule.ruleText,
                scope: rule.scope,
                languageScope: rule.languageScope,
                projectPath: rule.projectPath,
                createdAt: rule.createdAt,
                updatedAt: rule.updatedAt,
                isActive: rule.isActive
            }));

            Logger.info(`Loaded ${this.rules.length} rules from MongoDB`);
        } catch (error) {
            Logger.error('Failed to load rules from MongoDB', error as Error);
            if (this.fallbackToLocal) {
                Logger.info('Falling back to local storage');
                await this.loadRulesFromLocal();
            } else {
                throw error;
            }
        }
    }

    private async loadRulesFromLocal(): Promise<void> {
        try {
            if (fs.existsSync(this.localFilePath)) {
                const data = fs.readFileSync(this.localFilePath, 'utf8');
                this.rules = JSON.parse(data).map((rule: any) => ({
                    ...rule,
                    createdAt: new Date(rule.createdAt),
                    updatedAt: new Date(rule.updatedAt)
                }));
            } else {
                this.rules = [];
            }
        } catch (error) {
            console.error('Failed to load rules from local file:', error);
            this.rules = [];
        }
    }

    private async saveRulesToLocal(): Promise<void> {
        try {
            const dir = path.dirname(this.localFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.localFilePath, JSON.stringify(this.rules, null, 2));
        } catch (error) {
            console.error('Failed to save rules to local file:', error);
            throw error;
        }
    }

    async addRule(
        ruleText: string,
        scope: 'global' | 'project' | 'language',
        languageScope?: string
    ): Promise<void> {
        const rule: Rule = {
            ruleId: crypto.randomUUID(),
            ruleText,
            scope,
            languageScope,
            projectPath: scope === 'project' ? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath : undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        this.rules.push(rule);

        if (this.mongoService?.isConnected() && this.ruleModel) {
            try {
                await this.ruleModel.create(rule);
                Logger.info(`Saved rule ${rule.ruleId} to MongoDB`);
            } catch (error) {
                Logger.error('Failed to save rule to MongoDB', error as Error);
                if (this.fallbackToLocal) {
                    await this.saveRulesToLocal();
                } else {
                    throw error;
                }
            }
        } else {
            await this.saveRulesToLocal();
        }
    }

    async removeRule(ruleId: string): Promise<void> {
        this.rules = this.rules.filter(rule => rule.ruleId !== ruleId);

        if (this.mongoService?.isConnected() && this.ruleModel) {
            try {
                await this.ruleModel.findOneAndDelete({ ruleId });
                Logger.info(`Removed rule ${ruleId} from MongoDB`);
            } catch (error) {
                Logger.error('Failed to remove rule from MongoDB', error as Error);
                if (this.fallbackToLocal) {
                    await this.saveRulesToLocal();
                } else {
                    throw error;
                }
            }
        } else {
            await this.saveRulesToLocal();
        }
    }

    async getRules(scope?: 'global' | 'project' | 'language', languageId?: string): Promise<Rule[]> {
        let filteredRules = this.rules.filter(rule => rule.isActive);

        if (scope) {
            filteredRules = filteredRules.filter(rule => rule.scope === scope);
        }

        if (languageId) {
            filteredRules = filteredRules.filter(rule =>
                rule.scope !== 'language' || rule.languageScope === languageId
            );
        }

        // For project scope, filter by current workspace
        const currentProjectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (currentProjectPath) {
            filteredRules = filteredRules.filter(rule =>
                rule.scope !== 'project' || rule.projectPath === currentProjectPath
            );
        }

        return filteredRules;
    }

    async getActiveRulesForContext(languageId?: string): Promise<string[]> {
        const globalRules = await this.getRules('global');
        const projectRules = await this.getRules('project');
        const languageRules = languageId ? await this.getRules('language', languageId) : [];

        const allRules = [...globalRules, ...projectRules, ...languageRules];
        return allRules.map(rule => rule.ruleText);
    }

    /**
     * Cleanup resources and close MongoDB connection
     */
    async dispose(): Promise<void> {
        try {
            if (this.mongoService) {
                await this.mongoService.disconnect();
                Logger.info('MongoDB connection closed');
            }
        } catch (error) {
            Logger.error('Error during RuleManager cleanup', error as Error);
        }
    }

    /**
     * Get connection status and statistics
     */
    getConnectionInfo(): {
        isMongoConnected: boolean;
        fallbackEnabled: boolean;
        totalRules: number;
        connectionStats?: any;
    } {
        return {
            isMongoConnected: this.mongoService?.isConnected() || false,
            fallbackEnabled: this.fallbackToLocal,
            totalRules: this.rules.length,
            connectionStats: this.mongoService?.getConnectionStats()
        };
    }
}
