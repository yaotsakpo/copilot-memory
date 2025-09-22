import * as vscode from 'vscode';
import { RuleManager } from '../ruleManager';
import { Logger } from '../utils/logger';
import { validateRuleText, sanitizeInput, getCurrentLanguageId } from '../utils/helpers';
import { UI_MESSAGES, RULE_SCOPES } from '../constants';

/**
 * Handler for adding new rules to Copilot Memory
 */
export class AddRuleCommandHandler {
    constructor(private ruleManager: RuleManager) {}

    /**
     * Execute the add rule command
     */
    async execute(): Promise<void> {
        try {
            // Get rule text from user
            const ruleText = await this.getRuleTextFromUser();
            if (!ruleText) {
                return;
            }

            // Validate rule text
            const validation = validateRuleText(ruleText);
            if (!validation.isValid) {
                vscode.window.showErrorMessage(validation.error!);
                return;
            }

            // Get rule scope
            const scope = await this.getRuleScopeFromUser();
            if (!scope) {
                return;
            }

            // Get language scope if needed
            let languageScope: string | undefined;
            if (scope === 'language') {
                languageScope = await this.getLanguageScopeFromUser();
                if (!languageScope) {
                    return;
                }
            }

            // Add the rule
            const sanitizedText = sanitizeInput(ruleText);
            await this.ruleManager.addRule(sanitizedText, scope, languageScope);

            Logger.info(`Rule added successfully: ${sanitizedText} (scope: ${scope})`);
            vscode.window.showInformationMessage(UI_MESSAGES.ruleAdded);

        } catch (error) {
            const errorMessage = `Failed to add rule: ${error}`;
            Logger.error(errorMessage, error as Error);
            vscode.window.showErrorMessage(errorMessage);
        }
    }

    /**
     * Get rule text from user input
     */
    private async getRuleTextFromUser(): Promise<string | undefined> {
        return vscode.window.showInputBox({
            prompt: 'Enter your coding rule',
            placeHolder: 'e.g., Always use const instead of let for variables that are not reassigned',
            validateInput: (value: string) => {
                const validation = validateRuleText(value);
                return validation.isValid ? undefined : validation.error;
            }
        });
    }

    /**
     * Get rule scope from user selection
     */
    private async getRuleScopeFromUser(): Promise<'global' | 'project' | 'language' | undefined> {
        const items = RULE_SCOPES.map(scope => ({
            label: scope.charAt(0).toUpperCase() + scope.slice(1),
            description: this.getScopeDescription(scope),
            value: scope
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select rule scope',
            matchOnDescription: true
        });

        return selected?.value;
    }

    /**
     * Get language scope from user
     */
    private async getLanguageScopeFromUser(): Promise<string | undefined> {
        // Try to get from active editor first
        const currentLanguage = getCurrentLanguageId();
        if (currentLanguage) {
            const useCurrentLanguage = await vscode.window.showQuickPick(
                [
                    { label: `Use current language: ${currentLanguage}`, value: currentLanguage },
                    { label: 'Enter different language...', value: 'custom' }
                ],
                { placeHolder: 'Select language for this rule' }
            );

            if (useCurrentLanguage?.value === currentLanguage) {
                return currentLanguage;
            }
        }

        // Manual input
        return vscode.window.showInputBox({
            prompt: 'Enter language ID',
            placeHolder: 'e.g., typescript, javascript, python, java',
            validateInput: (value: string) => {
                return value.trim().length === 0 ? 'Language ID cannot be empty' : undefined;
            }
        });
    }

    /**
     * Get description for rule scope
     */
    private getScopeDescription(scope: string): string {
        switch (scope) {
            case 'global':
                return 'Applies to all projects and languages';
            case 'project':
                return 'Applies only to the current workspace';
            case 'language':
                return 'Applies only to specific programming language';
            default:
                return '';
        }
    }
}
