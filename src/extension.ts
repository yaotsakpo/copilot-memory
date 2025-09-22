import * as vscode from 'vscode';
import { RuleManager } from './ruleManager';
import { CopilotInterceptor } from './copilotInterceptor';

let ruleManager: RuleManager;
let copilotInterceptor: CopilotInterceptor;

export async function activate(context: vscode.ExtensionContext) {
    console.log('Copilot Memory extension is now active!');

    // Initialize rule manager
    ruleManager = new RuleManager(context);
    await ruleManager.initialize();

    // Initialize Copilot interceptor
    copilotInterceptor = new CopilotInterceptor(ruleManager);
    await copilotInterceptor.initialize();

    // Register commands
    const addRuleCommand = vscode.commands.registerCommand('copilotMemory.addRule', async () => {
        const ruleText = await vscode.window.showInputBox({
            prompt: 'Enter your rule',
            placeHolder: 'e.g., Always use const instead of let for variables that are not reassigned'
        });

        if (!ruleText) {
            return;
        }

        const scope = await vscode.window.showQuickPick(
            ['global', 'project', 'language'],
            {
                placeHolder: 'Select rule scope'
            }
        );

        if (!scope) {
            return;
        }

        let languageScope: string | undefined;
        if (scope === 'language') {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                languageScope = activeEditor.document.languageId;
            } else {
                languageScope = await vscode.window.showInputBox({
                    prompt: 'Enter language ID',
                    placeHolder: 'e.g., typescript, javascript, python'
                });
            }
        }

        try {
            await ruleManager.addRule(ruleText, scope as 'global' | 'project' | 'language', languageScope);
            vscode.window.showInformationMessage('Rule added successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to add rule: ${error}`);
        }
    });

    const listRulesCommand = vscode.commands.registerCommand('copilotMemory.listRules', async () => {
        try {
            const rules = await ruleManager.getRules();
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules found');
                return;
            }

            const ruleItems = rules.map(rule => ({
                label: `${rule.scope}: ${rule.ruleText.substring(0, 50)}...`,
                description: rule.languageScope || '',
                detail: rule.ruleText,
                rule
            }));

            const selectedRule = await vscode.window.showQuickPick(ruleItems, {
                placeHolder: 'Select a rule to view or remove'
            });

            if (selectedRule) {
                const action = await vscode.window.showQuickPick(
                    ['View', 'Delete'],
                    { placeHolder: 'What would you like to do?' }
                );

                if (action === 'View') {
                    vscode.window.showInformationMessage(selectedRule.rule.ruleText);
                } else if (action === 'Delete') {
                    await ruleManager.removeRule(selectedRule.rule.ruleId);
                    vscode.window.showInformationMessage('Rule removed successfully!');
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to list rules: ${error}`);
        }
    });

    const removeRuleCommand = vscode.commands.registerCommand('copilotMemory.removeRule', async () => {
        try {
            const rules = await ruleManager.getRules();
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules to remove');
                return;
            }

            const ruleItems = rules.map(rule => ({
                label: `${rule.scope}: ${rule.ruleText.substring(0, 50)}...`,
                description: rule.languageScope || '',
                detail: rule.ruleText,
                rule
            }));

            const selectedRule = await vscode.window.showQuickPick(ruleItems, {
                placeHolder: 'Select a rule to remove'
            });

            if (selectedRule) {
                await ruleManager.removeRule(selectedRule.rule.ruleId);
                vscode.window.showInformationMessage('Rule removed successfully!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to remove rule: ${error}`);
        }
    });

    context.subscriptions.push(addRuleCommand, listRulesCommand, removeRuleCommand);
}

export function deactivate() {
    if (copilotInterceptor) {
        copilotInterceptor.dispose();
    }
}
