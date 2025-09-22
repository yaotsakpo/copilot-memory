import * as vscode from 'vscode';
import { Logger } from '../utils/logger';

/**
 * Configuration validation schema for Copilot Memory extension
 */
export interface ExtensionConfig {
    mongodbUri: string;
    fallbackToLocal: boolean;
    maxRulesPerScope: number;
    enableAutoSync: boolean;
    syncIntervalMinutes: number;
    logLevel: 'info' | 'warn' | 'error';
    connectionTimeoutMs: number;
    retryAttempts: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ExtensionConfig = {
    mongodbUri: 'mongodb://localhost:27017/copilot-memory',
    fallbackToLocal: true,
    maxRulesPerScope: 100,
    enableAutoSync: false,
    syncIntervalMinutes: 30,
    logLevel: 'info',
    connectionTimeoutMs: 10000,
    retryAttempts: 3
};

/**
 * Configuration validation rules
 */
const VALIDATION_RULES = {
    mongodbUri: {
        required: false,
        pattern: /^mongodb:\/\/[^\s]+$/,
        message: 'MongoDB URI must be a valid MongoDB connection string starting with mongodb://'
    },
    fallbackToLocal: {
        required: true,
        type: 'boolean',
        message: 'fallbackToLocal must be a boolean value'
    },
    maxRulesPerScope: {
        required: false,
        type: 'number',
        min: 1,
        max: 1000,
        message: 'maxRulesPerScope must be a number between 1 and 1000'
    },
    enableAutoSync: {
        required: false,
        type: 'boolean',
        message: 'enableAutoSync must be a boolean value'
    },
    syncIntervalMinutes: {
        required: false,
        type: 'number',
        min: 5,
        max: 1440, // 24 hours
        message: 'syncIntervalMinutes must be a number between 5 and 1440 (24 hours)'
    },
    logLevel: {
        required: false,
        enum: ['info', 'warn', 'error'],
        message: 'logLevel must be one of: info, warn, error'
    },
    connectionTimeoutMs: {
        required: false,
        type: 'number',
        min: 1000,
        max: 60000, // 1 minute
        message: 'connectionTimeoutMs must be a number between 1000 and 60000 (1 minute)'
    },
    retryAttempts: {
        required: false,
        type: 'number',
        min: 0,
        max: 10,
        message: 'retryAttempts must be a number between 0 and 10'
    }
};

/**
 * Validation error details
 */
export interface ValidationError {
    property: string;
    value: any;
    message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    config: ExtensionConfig;
}

/**
 * Configuration validator for Copilot Memory extension
 */
export class ConfigValidator {
    /**
     * Validate the current VS Code configuration
     */
    public static validateCurrentConfig(): ValidationResult {
        const config = vscode.workspace.getConfiguration('copilotMemory');
        return this.validateConfig(config);
    }

    /**
     * Validate configuration object
     */
    public static validateConfig(config: vscode.WorkspaceConfiguration): ValidationResult {
        const errors: ValidationError[] = [];
        const validatedConfig: Partial<ExtensionConfig> = {};

        // Validate each configuration property
        for (const [key, rule] of Object.entries(VALIDATION_RULES)) {
            const value = config.get(key);
            const validationError = this.validateProperty(key, value, rule);

            if (validationError) {
                errors.push(validationError);
            } else {
                // Use the validated value or default
                validatedConfig[key as keyof ExtensionConfig] = value !== undefined
                    ? value as any
                    : DEFAULT_CONFIG[key as keyof ExtensionConfig];
            }
        }

        // Fill in any missing properties with defaults
        const finalConfig: ExtensionConfig = {
            ...DEFAULT_CONFIG,
            ...validatedConfig
        } as ExtensionConfig;

        return {
            isValid: errors.length === 0,
            errors,
            config: finalConfig
        };
    }

    /**
     * Validate a single property
     */
    private static validateProperty(key: string, value: any, rule: any): ValidationError | null {
        // Check if required property is missing
        if (rule.required && (value === undefined || value === null)) {
            return {
                property: key,
                value,
                message: `${key} is required but not provided`
            };
        }

        // Skip validation if value is undefined and not required
        if (value === undefined && !rule.required) {
            return null;
        }

        // Type validation
        if (rule.type && typeof value !== rule.type) {
            return {
                property: key,
                value,
                message: rule.message || `${key} must be of type ${rule.type}`
            };
        }

        // Pattern validation (for strings)
        if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
            return {
                property: key,
                value,
                message: rule.message || `${key} does not match required pattern`
            };
        }

        // Enum validation
        if (rule.enum && !rule.enum.includes(value)) {
            return {
                property: key,
                value,
                message: rule.message || `${key} must be one of: ${rule.enum.join(', ')}`
            };
        }

        // Range validation (for numbers)
        if (rule.type === 'number' && typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                return {
                    property: key,
                    value,
                    message: rule.message || `${key} must be at least ${rule.min}`
                };
            }

            if (rule.max !== undefined && value > rule.max) {
                return {
                    property: key,
                    value,
                    message: rule.message || `${key} must be at most ${rule.max}`
                };
            }
        }

        // String length validation
        if (typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                return {
                    property: key,
                    value,
                    message: rule.message || `${key} must be at least ${rule.minLength} characters`
                };
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                return {
                    property: key,
                    value,
                    message: rule.message || `${key} must be at most ${rule.maxLength} characters`
                };
            }
        }

        return null;
    }

    /**
     * Show validation errors to the user
     */
    public static showValidationErrors(errors: ValidationError[]): void {
        if (errors.length === 0) {
            return;
        }

        const errorMessages = errors.map(error =>
            `• ${error.property}: ${error.message}`
        ).join('\n');

        const message = `Copilot Memory configuration errors:\n\n${errorMessages}\n\nPlease check your settings and try again.`;

        vscode.window.showErrorMessage(message, 'Open Settings').then(selection => {
            if (selection === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'copilotMemory');
            }
        });

        Logger.error('Configuration validation failed', new Error(errorMessages));
    }

    /**
     * Get a safe, validated configuration
     */
    public static getSafeConfig(): ExtensionConfig {
        const validation = this.validateCurrentConfig();

        if (!validation.isValid) {
            Logger.warn('Configuration validation failed, using safe defaults');
            this.showValidationErrors(validation.errors);
        }

        return validation.config;
    }

    /**
     * Watch for configuration changes and validate them
     */
    public static startConfigWatcher(context: vscode.ExtensionContext): void {
        const disposable = vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('copilotMemory')) {
                Logger.info('Configuration changed, validating...');
                const validation = this.validateCurrentConfig();

                if (!validation.isValid) {
                    this.showValidationErrors(validation.errors);
                } else {
                    Logger.info('Configuration validated successfully');
                }
            }
        });

        context.subscriptions.push(disposable);
    }
}
