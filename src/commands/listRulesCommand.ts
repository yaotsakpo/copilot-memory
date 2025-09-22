import * as vscode from 'vscode';
import { RuleManager, Rule } from '../ruleManager';
import { Logger } from '../utils/logger';
import { UI_MESSAGES } from '../constants';

/**
 * Handler for listing rules in Copilot Memory
 */
export class ListRulesCommandHandler {
    constructor(private ruleManager: RuleManager) {}

    /**
     * Execute the list rules command
     */
    async execute(): Promise<void> {
        try {
            const rules = await this.ruleManager.getRules();

            if (rules.length === 0) {
                vscode.window.showInformationMessage(UI_MESSAGES.noRulesFound);
                return;
            }

            await this.displayRules(rules);
            Logger.info(`Listed ${rules.length} rules`);

        } catch (error) {
            const errorMessage = `Failed to list rules: ${error}`;
            Logger.error(errorMessage, error as Error);
            vscode.window.showErrorMessage(errorMessage);
        }
    }

    /**
     * Display rules in a quick pick interface
     */
    private async displayRules(rules: Rule[]): Promise<void> {
        const items = rules.map(rule => ({
            label: rule.ruleText,
            description: this.formatRuleDescription(rule),
            detail: `Created: ${rule.createdAt.toLocaleDateString()}`,
            rule
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: `Select a rule to view details (${rules.length} total)`,
            matchOnDetail: true,
            matchOnDescription: true
        });

        if (selected) {
            await this.showRuleDetails(selected.rule);
        }
    }

    /**
     * Format rule description for display
     */
    private formatRuleDescription(rule: Rule): string {
        let description = `📍 ${rule.scope}`;

        if (rule.scope === 'language' && rule.languageScope) {
            description += ` (${rule.languageScope})`;
        } else if (rule.scope === 'project' && rule.projectPath) {
            const projectName = rule.projectPath.split('/').pop() || 'Unknown';
            description += ` (${projectName})`;
        }

        if (!rule.isActive) {
            description += ' ⏸️ Inactive';
        }

        return description;
    }

    /**
     * Show detailed information about a specific rule
     */
    private async showRuleDetails(rule: Rule): Promise<void> {
        const actions = ['Copy Rule Text', 'Edit Rule', 'Toggle Active/Inactive'];

        const action = await vscode.window.showInformationMessage(
            `Rule: ${rule.ruleText}\\n\\n` +
            `Scope: ${rule.scope}\\n` +
            `Language: ${rule.languageScope || 'All'}\\n` +
            `Status: ${rule.isActive ? 'Active' : 'Inactive'}\\n` +
            `Created: ${rule.createdAt.toLocaleString()}\\n` +
            `Updated: ${rule.updatedAt.toLocaleString()}`,
            ...actions
        );

        switch (action) {
            case 'Copy Rule Text':
                await vscode.env.clipboard.writeText(rule.ruleText);
                vscode.window.showInformationMessage('Rule text copied to clipboard');
                break;
            case 'Edit Rule':
                await this.editRule(rule);
                break;
            case 'Toggle Active/Inactive':
                await this.toggleRuleStatus(rule);
                break;
        }
    }

    /**
     * Edit an existing rule
     */
    private async editRule(rule: Rule): Promise<void> {
        const newText = await vscode.window.showInputBox({
            prompt: 'Edit rule text',
            value: rule.ruleText,
            validateInput: (value: string) => {
                return value.trim().length === 0 ? 'Rule text cannot be empty' : undefined;
            }
        });

        if (newText && newText !== rule.ruleText) {
            // Note: This would require implementing an updateRule method in RuleManager
            vscode.window.showInformationMessage('Rule editing will be implemented in a future version');
            Logger.info(`Rule edit requested: ${rule.ruleId}`);
        }
    }

    /**
     * Toggle rule active status
     */
    private async toggleRuleStatus(rule: Rule): Promise<void> {
        // Note: This would require implementing a toggleRule method in RuleManager
        vscode.window.showInformationMessage('Rule status toggle will be implemented in a future version');
        Logger.info(`Rule status toggle requested: ${rule.ruleId}`);
    }
}
