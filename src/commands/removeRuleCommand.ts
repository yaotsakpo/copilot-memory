import * as vscode from 'vscode';
import { RuleManager, Rule } from '../ruleManager';
import { Logger } from '../utils/logger';
import { UI_MESSAGES } from '../constants';

/**
 * Handler for removing rules from Copilot Memory
 */
export class RemoveRuleCommandHandler {
    constructor(private ruleManager: RuleManager) {}

    /**
     * Execute the remove rule command
     */
    async execute(): Promise<void> {
        try {
            const rules = await this.ruleManager.getRules();

            if (rules.length === 0) {
                vscode.window.showInformationMessage(UI_MESSAGES.noRulesFound);
                return;
            }

            const ruleToRemove = await this.selectRuleToRemove(rules);
            if (!ruleToRemove) {
                return;
            }

            const confirmed = await this.confirmRemoval(ruleToRemove);
            if (!confirmed) {
                return;
            }

            await this.ruleManager.removeRule(ruleToRemove.ruleId);

            Logger.info(`Rule removed: ${ruleToRemove.ruleText}`);
            vscode.window.showInformationMessage(UI_MESSAGES.ruleRemoved);

        } catch (error) {
            const errorMessage = `Failed to remove rule: ${error}`;
            Logger.error(errorMessage, error as Error);
            vscode.window.showErrorMessage(errorMessage);
        }
    }

    /**
     * Let user select which rule to remove
     */
    private async selectRuleToRemove(rules: Rule[]): Promise<Rule | undefined> {
        const items = rules.map(rule => ({
            label: rule.ruleText,
            description: this.formatRuleDescription(rule),
            detail: `Created: ${rule.createdAt.toLocaleDateString()}`,
            rule
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a rule to remove',
            matchOnDetail: true,
            matchOnDescription: true
        });

        return selected?.rule;
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
     * Confirm rule removal with user
     */
    private async confirmRemoval(rule: Rule): Promise<boolean> {
        const response = await vscode.window.showWarningMessage(
            `Are you sure you want to remove this rule?\\n\\n"${rule.ruleText}"\\n\\nThis action cannot be undone.`,
            { modal: true },
            'Remove Rule',
            'Cancel'
        );

        return response === 'Remove Rule';
    }
}

/**
 * Handler for bulk operations on rules
 */
export class BulkRuleCommandHandler {
    constructor(private ruleManager: RuleManager) {}

    /**
     * Remove all rules with confirmation
     */
    async removeAllRules(): Promise<void> {
        try {
            const rules = await this.ruleManager.getRules();

            if (rules.length === 0) {
                vscode.window.showInformationMessage(UI_MESSAGES.noRulesFound);
                return;
            }

            const confirmed = await vscode.window.showWarningMessage(
                `Are you sure you want to remove ALL ${rules.length} rules?\\n\\nThis action cannot be undone.`,
                { modal: true },
                'Remove All Rules',
                'Cancel'
            );

            if (confirmed !== 'Remove All Rules') {
                return;
            }

            // Remove all rules
            for (const rule of rules) {
                await this.ruleManager.removeRule(rule.ruleId);
            }

            Logger.info(`Removed all ${rules.length} rules`);
            vscode.window.showInformationMessage(`Successfully removed all ${rules.length} rules`);

        } catch (error) {
            const errorMessage = `Failed to remove all rules: ${error}`;
            Logger.error(errorMessage, error as Error);
            vscode.window.showErrorMessage(errorMessage);
        }
    }

    /**
     * Export rules to JSON file
     */
    async exportRules(): Promise<void> {
        try {
            const rules = await this.ruleManager.getRules();

            if (rules.length === 0) {
                vscode.window.showInformationMessage(UI_MESSAGES.noRulesFound);
                return;
            }

            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('copilot-memory-rules.json'),
                filters: {
                    jsonFiles: ['json'],
                    allFiles: ['*']
                }
            });

            if (!uri) {
                return;
            }

            const exportData = {
                exportedAt: new Date().toISOString(),
                totalRules: rules.length,
                rules: rules
            };

            await vscode.workspace.fs.writeFile(
                uri,
                Buffer.from(JSON.stringify(exportData, null, 2))
            );

            Logger.info(`Exported ${rules.length} rules to ${uri.fsPath}`);
            vscode.window.showInformationMessage(`Successfully exported ${rules.length} rules`);

        } catch (error) {
            const errorMessage = `Failed to export rules: ${error}`;
            Logger.error(errorMessage, error as Error);
            vscode.window.showErrorMessage(errorMessage);
        }
    }
}
