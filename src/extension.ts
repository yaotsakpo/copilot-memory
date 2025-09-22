import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// Simple rule interface for local storage
interface SimpleRule {
    id: string;
    text: string;
    scope: 'global' | 'project' | 'language';
    createdAt: string;
}

let rules: SimpleRule[] = [];
let storageFile: string = '';
let copilotRulesProvider: vscode.Disposable | undefined;

// Simple storage functions
function getStorageFile(context: vscode.ExtensionContext): string {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (workspaceRoot) {
        return path.join(workspaceRoot, '.copilot-memory.json');
    }
    return path.join(context.globalStorageUri.fsPath, 'copilot-memory.json');
}

function loadRules(): void {
    try {
        if (fs.existsSync(storageFile)) {
            const data = fs.readFileSync(storageFile, 'utf8');
            rules = JSON.parse(data) || [];
        }
    } catch (error) {
        rules = [];
    }
}

function saveRules(): void {
    try {
        const dir = path.dirname(storageFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(storageFile, JSON.stringify(rules, null, 2));
    } catch (error) {
        console.error('Failed to save rules:', error);
    }
}

/**
 * This method is called when your extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Activating Copilot Memory extension...');

    try {
        // Initialize storage
        storageFile = getStorageFile(context);
        loadRules();

        // Register commands immediately
        registerCommands(context);

        // Register Copilot integration
        registerCopilotIntegration(context);

        console.log('Copilot Memory extension activated successfully');
        return {};

    } catch (error) {
        console.error('Failed to activate Copilot Memory extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Copilot Memory: ${error}`);
    }
}

function registerCommands(context: vscode.ExtensionContext): void {
    // Add Rule Command
    const addRuleCommand = vscode.commands.registerCommand('copilotMemory.addRule', async () => {
        try {
            const ruleText = await vscode.window.showInputBox({
                prompt: 'Enter your coding rule or preference',
                placeHolder: 'e.g., Always use const instead of let for constants'
            });

            if (!ruleText) {
                return;
            }

            const scope = await vscode.window.showQuickPick(['global', 'project', 'language'], {
                placeHolder: 'Select rule scope'
            });

            if (!scope) {
                return;
            }

            // Add rule to simple storage
            const newRule: SimpleRule = {
                id: Date.now().toString(),
                text: ruleText,
                scope: scope as 'global' | 'project' | 'language',
                createdAt: new Date().toISOString()
            };

            rules.push(newRule);
            saveRules();

            vscode.window.showInformationMessage(`Rule added successfully with ${scope} scope!`);

        } catch (error) {
            console.error('Failed to add rule:', error);
            vscode.window.showErrorMessage(`Failed to add rule: ${error}`);
        }
    });

    // List Rules Command
    const listRulesCommand = vscode.commands.registerCommand('copilotMemory.listRules', async () => {
        try {
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules found. Use "Add Rule" to create your first rule.');
                return;
            }

            const ruleItems = rules.map(rule => ({
                label: rule.text,
                description: `${rule.scope} scope`,
                detail: `Created: ${new Date(rule.createdAt).toLocaleDateString()}`
            }));

            await vscode.window.showQuickPick(ruleItems, {
                placeHolder: `Your ${rules.length} coding rules`
            });

        } catch (error) {
            console.error('Failed to list rules:', error);
            vscode.window.showErrorMessage(`Failed to list rules: ${error}`);
        }
    });

    // Remove Rule Command
    const removeRuleCommand = vscode.commands.registerCommand('copilotMemory.removeRule', async () => {
        try {
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules to remove.');
                return;
            }

            const ruleItems = rules.map(rule => ({
                label: rule.text,
                description: `${rule.scope} scope`,
                ruleId: rule.id
            }));

            const selected = await vscode.window.showQuickPick(ruleItems, {
                placeHolder: 'Select rule to remove'
            });

            if (selected) {
                rules = rules.filter(rule => rule.id !== selected.ruleId);
                saveRules();
                vscode.window.showInformationMessage('Rule removed successfully!');
            }

        } catch (error) {
            console.error('Failed to remove rule:', error);
            vscode.window.showErrorMessage(`Failed to remove rule: ${error}`);
        }
    });

    // Auto-Apply Rules Command (new)
    const autoApplyRulesCommand = vscode.commands.registerCommand('copilotMemory.autoApplyRules', async () => {
        if (rules.length === 0) {
            vscode.window.showInformationMessage('No rules to apply. Add some rules first.');
            return;
        }

        const chatPrompt = `Please remember and follow these rules in our conversation:

${rules.map((rule, index) => `${index + 1}. ${rule.text}`).join('\n')}

Start by saying "Good morning! I'll follow your ${rules.length} rules." then help me with my request.`;

        await vscode.env.clipboard.writeText(chatPrompt);

        // Try to open Copilot Chat and show instructions
        try {
            await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            vscode.window.showInformationMessage(
                '✅ Rules copied to clipboard! The chat panel is open - just paste (Cmd+V) to apply your rules.',
                'Got it!'
            );
        } catch {
            vscode.window.showInformationMessage(
                '✅ Rules copied to clipboard! Open Copilot Chat and paste to apply your rules.',
                'Open Chat'
            ).then(selection => {
                if (selection === 'Open Chat') {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                }
            });
        }
    });

    // Copy Rules for Chat Command
    const copyRulesForChatCommand = vscode.commands.registerCommand('copilotMemory.copyRulesForChat', async () => {
        try {
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules to copy. Add some rules first.');
                return;
            }

            // Create a formatted prompt with all rules
            const chatPrompt = `Please follow these coding preferences and rules in all your responses:

${rules.map((rule, index) => `${index + 1}. ${rule.text} (${rule.scope} scope)`).join('\n')}

Remember to apply these rules when helping me with code, explanations, and suggestions.`;

            // Copy to clipboard
            await vscode.env.clipboard.writeText(chatPrompt);

            vscode.window.showInformationMessage(
                `✅ Copied ${rules.length} rules to clipboard! Paste this into Copilot Chat to apply your preferences.`,
                'Open Copilot Chat'
            ).then(selection => {
                if (selection === 'Open Copilot Chat') {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                }
            });

        } catch (error) {
            console.error('Failed to copy rules for chat:', error);
            vscode.window.showErrorMessage(`Failed to copy rules: ${error}`);
        }
    });

    // Add commands to context immediately
    context.subscriptions.push(addRuleCommand, listRulesCommand, removeRuleCommand, copyRulesForChatCommand, autoApplyRulesCommand);
    console.log('Commands registered: copilotMemory.addRule, copilotMemory.listRules, copilotMemory.removeRule, copilotMemory.copyRulesForChat, copilotMemory.autoApplyRules');
}

function registerCopilotIntegration(context: vscode.ExtensionContext): void {
    // Create a completion provider that injects rules as comments
    copilotRulesProvider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file' }, // All file types
        {
            provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
                if (rules.length === 0) {
                    return [];
                }

                // Get relevant rules for current language
                const languageId = document.languageId;
                const relevantRules = rules.filter(rule =>
                    rule.scope === 'global' ||
                    rule.scope === 'language' && rule.text.includes(languageId) ||
                    rule.scope === 'project'
                );

                if (relevantRules.length === 0) {
                    return [];
                }

                // Create a completion item that adds rules as comments
                const rulesComment = new vscode.CompletionItem(
                    '💭 Apply Copilot Memory Rules',
                    vscode.CompletionItemKind.Snippet
                );

                // Generate comment text with rules
                const commentPrefix = getCommentPrefix(languageId);
                const rulesText = relevantRules
                    .map(rule => `${commentPrefix} ${rule.text}`)
                    .join('\n');

                rulesComment.insertText = new vscode.SnippetString(rulesText + '\n');
                rulesComment.documentation = new vscode.MarkdownString(
                    `Insert your Copilot Memory rules as comments to influence code generation:\n\n${relevantRules.map(r => `• ${r.text}`).join('\n')}`
                );
                rulesComment.sortText = '0'; // Prioritize this item

                return [rulesComment];
            }
        },
        ' ', '\n' // Trigger on space and newline
    );

    context.subscriptions.push(copilotRulesProvider);

    // Auto-detect when Copilot Chat is opened and offer to copy rules
    const windowStateListener = vscode.window.onDidChangeWindowState(state => {
        if (state.focused && rules.length > 0) {
            // Check if Copilot Chat panel is visible (this is a workaround)
            setTimeout(() => {
                vscode.window.showInformationMessage(
                    `🤖 Auto-apply ${rules.length} Copilot Memory rules to your chat?`,
                    'Yes, Copy Rules',
                    'Not Now'
                ).then(selection => {
                    if (selection === 'Yes, Copy Rules') {
                        vscode.commands.executeCommand('copilotMemory.copyRulesForChat');
                    }
                });
            }, 1000); // Small delay to avoid spam
        }
    });

    // Also monitor when chat commands are executed
    const commandListener = vscode.commands.registerCommand('copilotMemory.autoApplyRules', async () => {
        if (rules.length > 0) {
            await vscode.commands.executeCommand('copilotMemory.copyRulesForChat');
            vscode.window.showInformationMessage('Rules copied! Paste into your chat to apply them.');
        }
    });    context.subscriptions.push(windowStateListener, commandListener);
    console.log('Copilot integration registered');
}

function getCommentPrefix(languageId: string): string {
    switch (languageId) {
        case 'javascript':
        case 'typescript':
        case 'java':
        case 'cpp':
        case 'csharp':
            return '//';
        case 'python':
        case 'shell':
            return '#';
        case 'html':
        case 'xml':
            return '<!--';
        default:
            return '//';
    }
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
    console.log('Deactivating Copilot Memory extension...');
}
