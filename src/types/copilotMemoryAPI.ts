import * as vscode from 'vscode';

/**
 * Type definitions for third-party extensions using Copilot Memory API
 *
 * Usage example:
 * ```typescript
 * import * as vscode from 'vscode';
 * import { CopilotMemoryAPI } from './types/copilotMemoryAPI';
 *
 * // Get Copilot Memory API
 * const copilotMemoryExt = vscode.extensions.getExtension('yaotsakpo.copilot-memory');
 * if (copilotMemoryExt) {
 *   const api: CopilotMemoryAPI = copilotMemoryExt.exports;
 *
 *   // Add a rule
 *   const ruleId = await api.addRule('Always use TypeScript interfaces', 'global');
 *
 *   // Subscribe to changes
 *   const disposable = api.onRuleChanged(event => {
 *     console.log('Rule changed:', event);
 *   });
 * }
 * ```
 */

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

export type RuleChangeEventType = 'added' | 'removed' | 'updated' | 'activated' | 'deactivated';

export interface RuleChangeEvent {
    type: RuleChangeEventType;
    ruleId: string;
    rule?: Rule;
    timestamp: Date;
}

export type CustomScopeValidator = (context: {
    languageId?: string;
    projectPath?: string;
    filePath?: string;
    workspaceRoot?: string;
}) => boolean;

/**
 * Main API interface for third-party extensions
 */
export interface CopilotMemoryAPI {
    /**
     * Add a new rule programmatically
     *
     * @param ruleText - The rule text (max 500 characters)
     * @param scope - Rule scope: 'global', 'project', or 'language'
     * @param options - Additional options
     * @returns Promise resolving to the new rule ID
     *
     * @example
     * ```typescript
     * const ruleId = await api.addRule(
     *   'Always use const instead of let',
     *   'language',
     *   { languageScope: 'typescript' }
     * );
     * ```
     */
    addRule(ruleText: string, scope: 'global' | 'project' | 'language', options?: {
        languageScope?: string;
        projectPath?: string;
        isActive?: boolean;
    }): Promise<string>;

    /**
     * Remove a rule by ID
     *
     * @param ruleId - The rule ID to remove
     * @returns Promise resolving to true if removed, false if not found
     */
    removeRule(ruleId: string): Promise<boolean>;

    /**
     * Get all rules matching criteria
     *
     * @param filters - Optional filters to apply
     * @returns Promise resolving to matching rules
     *
     * @example
     * ```typescript
     * // Get all active global rules
     * const globalRules = await api.getRules({ scope: 'global', isActive: true });
     *
     * // Get all TypeScript rules
     * const tsRules = await api.getRules({
     *   scope: 'language',
     *   languageId: 'typescript'
     * });
     * ```
     */
    getRules(filters?: {
        scope?: 'global' | 'project' | 'language';
        languageId?: string;
        projectPath?: string;
        isActive?: boolean;
    }): Promise<Rule[]>;

    /**
     * Get active rules for current context
     *
     * @param languageId - Optional language ID to filter by
     * @returns Promise resolving to array of rule texts
     */
    getActiveRulesForContext(languageId?: string): Promise<string[]>;

    /**
     * Register a custom rule scope
     *
     * @param scopeName - Unique name for the custom scope
     * @param validator - Function to validate if scope applies to context
     *
     * @example
     * ```typescript
     * api.registerCustomScope('test-files', (context) => {
     *   return context.filePath?.includes('.test.') ||
     *          context.filePath?.includes('.spec.');
     * });
     * ```
     */
    registerCustomScope(scopeName: string, validator: CustomScopeValidator): void;

    /**
     * Subscribe to rule changes
     *
     * @param listener - Function to call when rules change
     * @returns Disposable to unsubscribe
     *
     * @example
     * ```typescript
     * const disposable = api.onRuleChanged(event => {
     *   console.log(`Rule ${event.type}: ${event.ruleId}`);
     * });
     *
     * // Later...
     * disposable.dispose();
     * ```
     */
    onRuleChanged(listener: (event: RuleChangeEvent) => void): vscode.Disposable;

    /**
     * Get extension version and capabilities
     *
     * @returns Extension version string
     */
    getVersion(): string;

    /**
     * Check if MongoDB is connected
     *
     * @returns True if MongoDB is connected, false otherwise
     */
    isMongoConnected(): boolean;
}

/**
 * Helper function to get Copilot Memory API
 *
 * @returns Promise resolving to the API instance or null if not available
 *
 * @example
 * ```typescript
 * import { getCopilotMemoryAPI } from './types/copilotMemoryAPI';
 *
 * const api = await getCopilotMemoryAPI();
 * if (api) {
 *   const rules = await api.getRules();
 *   console.log(`Found ${rules.length} rules`);
 * }
 * ```
 */
export async function getCopilotMemoryAPI(): Promise<CopilotMemoryAPI | null> {
    const extension = vscode.extensions.getExtension('yaotsakpo.copilot-memory');

    if (!extension) {
        return null;
    }

    if (!extension.isActive) {
        await extension.activate();
    }

    return extension.exports as CopilotMemoryAPI;
}
