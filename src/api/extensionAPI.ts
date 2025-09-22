import * as vscode from 'vscode';
import { Rule } from '../ruleManager';

/**
 * Public API interface for third-party extensions
 */
export interface CopilotMemoryAPI {
    /**
     * Add a new rule programmatically
     */
    addRule(ruleText: string, scope: 'global' | 'project' | 'language', options?: {
        languageScope?: string;
        projectPath?: string;
        isActive?: boolean;
    }): Promise<string>; // Returns ruleId

    /**
     * Remove a rule by ID
     */
    removeRule(ruleId: string): Promise<boolean>;

    /**
     * Get all rules matching criteria
     */
    getRules(filters?: {
        scope?: 'global' | 'project' | 'language';
        languageId?: string;
        projectPath?: string;
        isActive?: boolean;
    }): Promise<Rule[]>;

    /**
     * Get active rules for current context
     */
    getActiveRulesForContext(languageId?: string): Promise<string[]>;

    /**
     * Register a custom rule scope
     */
    registerCustomScope(scopeName: string, validator: (context: any) => boolean): void;

    /**
     * Subscribe to rule changes
     */
    onRuleChanged(listener: (event: RuleChangeEvent) => void): vscode.Disposable;

    /**
     * Get extension version and capabilities
     */
    getVersion(): string;

    /**
     * Check if MongoDB is connected
     */
    isMongoConnected(): boolean;
}

/**
 * Rule change event types
 */
export type RuleChangeEventType = 'added' | 'removed' | 'updated' | 'activated' | 'deactivated';

/**
 * Rule change event data
 */
export interface RuleChangeEvent {
    type: RuleChangeEventType;
    ruleId: string;
    rule?: Rule;
    timestamp: Date;
}

/**
 * Custom scope validator function type
 */
export type CustomScopeValidator = (context: {
    languageId?: string;
    projectPath?: string;
    filePath?: string;
    workspaceRoot?: string;
}) => boolean;

/**
 * Custom scope registration
 */
export interface CustomScope {
    name: string;
    validator: CustomScopeValidator;
    description?: string;
}

/**
 * Extension API implementation
 */
export class ExtensionAPI implements CopilotMemoryAPI {
    private ruleManager: any; // Will be injected
    private customScopes: Map<string, CustomScope> = new Map();
    private changeListeners: Set<(event: RuleChangeEvent) => void> = new Set();
    private extensionVersion: string;

    constructor(ruleManager: any, extensionVersion: string) {
        this.ruleManager = ruleManager;
        this.extensionVersion = extensionVersion;
    }

    /**
     * Add a new rule programmatically
     */
    async addRule(
        ruleText: string,
        scope: 'global' | 'project' | 'language',
        options: {
            languageScope?: string;
            projectPath?: string;
            isActive?: boolean;
        } = {}
    ): Promise<string> {
        if (!ruleText || ruleText.trim().length === 0) {
            throw new Error('Rule text cannot be empty');
        }

        if (ruleText.length > 500) {
            throw new Error('Rule text must be less than 500 characters');
        }

        // For language scope, languageScope is required
        if (scope === 'language' && !options.languageScope) {
            throw new Error('languageScope is required for language-scoped rules');
        }

        // For project scope, use current workspace or provided path
        let projectPath = options.projectPath;
        if (scope === 'project' && !projectPath) {
            projectPath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!projectPath) {
                throw new Error('No workspace folder available for project-scoped rule');
            }
        }

        const ruleId = await this.ruleManager.addRule(
            ruleText,
            scope,
            options.languageScope,
            projectPath
        );

        // Emit change event
        this.emitRuleChangeEvent('added', ruleId);

        return ruleId;
    }

    /**
     * Remove a rule by ID
     */
    async removeRule(ruleId: string): Promise<boolean> {
        if (!ruleId) {
            throw new Error('Rule ID is required');
        }

        try {
            await this.ruleManager.removeRule(ruleId);
            this.emitRuleChangeEvent('removed', ruleId);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get all rules matching criteria
     */
    async getRules(filters: {
        scope?: 'global' | 'project' | 'language';
        languageId?: string;
        projectPath?: string;
        isActive?: boolean;
    } = {}): Promise<Rule[]> {
        const allRules = await this.ruleManager.getRules(filters.scope, filters.languageId);

        return allRules.filter((rule: Rule) => {
            if (filters.isActive !== undefined && rule.isActive !== filters.isActive) {
                return false;
            }

            if (filters.projectPath && rule.projectPath !== filters.projectPath) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get active rules for current context
     */
    async getActiveRulesForContext(languageId?: string): Promise<string[]> {
        return this.ruleManager.getActiveRulesForContext(languageId);
    }

    /**
     * Register a custom rule scope
     */
    registerCustomScope(scopeName: string, validator: CustomScopeValidator): void {
        if (!scopeName || typeof scopeName !== 'string') {
            throw new Error('Scope name must be a non-empty string');
        }

        if (typeof validator !== 'function') {
            throw new Error('Validator must be a function');
        }

        // Prevent overriding built-in scopes
        if (['global', 'project', 'language'].includes(scopeName)) {
            throw new Error(`Cannot override built-in scope: ${scopeName}`);
        }

        this.customScopes.set(scopeName, {
            name: scopeName,
            validator,
            description: `Custom scope: ${scopeName}`
        });
    }

    /**
     * Subscribe to rule changes
     */
    onRuleChanged(listener: (event: RuleChangeEvent) => void): vscode.Disposable {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }

        this.changeListeners.add(listener);

        return new vscode.Disposable(() => {
            this.changeListeners.delete(listener);
        });
    }

    /**
     * Get extension version and capabilities
     */
    getVersion(): string {
        return this.extensionVersion;
    }

    /**
     * Check if MongoDB is connected
     */
    isMongoConnected(): boolean {
        return this.ruleManager.getConnectionInfo?.()?.isMongoConnected || false;
    }

    /**
     * Get available custom scopes
     */
    getCustomScopes(): CustomScope[] {
        return Array.from(this.customScopes.values());
    }

    /**
     * Validate context against custom scope
     */
    validateCustomScopeContext(scopeName: string, context: any): boolean {
        const scope = this.customScopes.get(scopeName);
        if (!scope) {
            return false;
        }

        try {
            return scope.validator(context);
        } catch (error) {
            console.warn(`Custom scope validation error for ${scopeName}:`, error);
            return false;
        }
    }

    /**
     * Emit rule change event to all listeners
     */
    private emitRuleChangeEvent(type: RuleChangeEventType, ruleId: string, rule?: Rule): void {
        const event: RuleChangeEvent = {
            type,
            ruleId,
            rule,
            timestamp: new Date()
        };

        this.changeListeners.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error('Error in rule change listener:', error);
            }
        });
    }

    /**
     * Dispose of all resources
     */
    dispose(): void {
        this.changeListeners.clear();
        this.customScopes.clear();
    }
}
