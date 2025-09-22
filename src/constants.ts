/**
 * Extension constants and configuration
 */

export const EXTENSION_CONFIG = {
    name: 'Copilot Memory',
    commandPrefix: 'copilotMemory',
    configSection: 'copilotMemory'
} as const;

export const COMMANDS = {
    addRule: `${EXTENSION_CONFIG.commandPrefix}.addRule`,
    listRules: `${EXTENSION_CONFIG.commandPrefix}.listRules`,
    removeRule: `${EXTENSION_CONFIG.commandPrefix}.removeRule`
} as const;

export const RULE_SCOPES = ['global', 'project', 'language'] as const;
export type RuleScope = typeof RULE_SCOPES[number];

export const STORAGE_CONSTANTS = {
    localFileName: '.copilot-memory.json',
    defaultMongoUri: 'mongodb://localhost:27017/copilot-memory'
} as const;

export const UI_MESSAGES = {
    extensionActivated: 'Copilot Memory extension is now active!',
    ruleAdded: 'Rule added successfully!',
    ruleRemoved: 'Rule removed successfully!',
    noRulesFound: 'No rules found',
    mongodbConnected: 'Connected to MongoDB',
    mongodbFailed: 'Failed to connect to MongoDB'
} as const;
