import * as vscode from 'vscode';
import { RuleManager } from './ruleManager';
import { Logger } from './utils/logger';

let globalRuleManager: RuleManager | undefined;

/**
 * This method is called when your extension is activated
 */
export async function activate(context: vscode.ExtensionContext) {
    Logger.info('Activating Copilot Memory extension...');
    
    try {
        // Register commands IMMEDIATELY - don't wait for anything
        registerCommands(context);
        
        // Initialize RuleManager in background
        initializeRuleManagerAsync(context);
        
        Logger.info('Copilot Memory extension activated successfully');
        return {};
        
    } catch (error) {
        Logger.error('Failed to activate Copilot Memory extension', error as Error);
        
        // Even if activation fails, try to register basic commands
        try {
            registerBasicCommands(context);
        } catch (fallbackError) {
            Logger.error('Failed to register fallback commands', fallbackError as Error);
        }
        
        throw error;
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
            
            // Ensure RuleManager exists
            if (!globalRuleManager) {
                globalRuleManager = new RuleManager(context);
                await globalRuleManager.initialize();
            }
            
            await globalRuleManager.addRule(ruleText, scope as any);
            vscode.window.showInformationMessage(`Rule added successfully with ${scope} scope!`);
            
        } catch (error) {
            Logger.error('Failed to add rule', error as Error);
            vscode.window.showErrorMessage(`Failed to add rule: ${error}`);
        }
    });

    // List Rules Command
    const listRulesCommand = vscode.commands.registerCommand('copilotMemory.listRules', async () => {
        try {
            if (!globalRuleManager) {
                vscode.window.showInformationMessage('No rules available yet. Add a rule first.');
                return;
            }
            
            const rules = await globalRuleManager.getRules();
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules found. Use "Add Rule" to create your first rule.');
                return;
            }

            const ruleItems = rules.map(rule => ({
                label: rule.ruleText,
                description: `${rule.scope} scope`,
                detail: `Created: ${rule.createdAt?.toLocaleDateString() || 'Unknown'}`
            }));

            await vscode.window.showQuickPick(ruleItems, {
                placeHolder: `Your ${rules.length} coding rules`
            });
            
        } catch (error) {
            Logger.error('Failed to list rules', error as Error);
            vscode.window.showErrorMessage(`Failed to list rules: ${error}`);
        }
    });

    // Remove Rule Command
    const removeRuleCommand = vscode.commands.registerCommand('copilotMemory.removeRule', async () => {
        try {
            if (!globalRuleManager) {
                vscode.window.showInformationMessage('No rules available to remove.');
                return;
            }

            const rules = await globalRuleManager.getRules();
            if (rules.length === 0) {
                vscode.window.showInformationMessage('No rules to remove.');
                return;
            }

            const ruleItems = rules.map(rule => ({
                label: rule.ruleText,
                description: `${rule.scope} scope`,
                ruleId: rule.ruleId
            }));

            const selected = await vscode.window.showQuickPick(ruleItems, {
                placeHolder: 'Select rule to remove'
            });

            if (selected) {
                await globalRuleManager.removeRule(selected.ruleId);
                vscode.window.showInformationMessage('Rule removed successfully!');
            }
            
        } catch (error) {
            Logger.error('Failed to remove rule', error as Error);
            vscode.window.showErrorMessage(`Failed to remove rule: ${error}`);
        }
    });

    // Add commands to context immediately
    context.subscriptions.push(addRuleCommand, listRulesCommand, removeRuleCommand);
    Logger.info('Commands registered: copilotMemory.addRule, copilotMemory.listRules, copilotMemory.removeRule');
}

function registerBasicCommands(context: vscode.ExtensionContext): void {
    const basicAddCommand = vscode.commands.registerCommand('copilotMemory.addRule', async () => {
        vscode.window.showErrorMessage('Copilot Memory failed to initialize properly. Please restart VS Code.');
    });
    
    context.subscriptions.push(basicAddCommand);
    Logger.info('Basic fallback commands registered');
}

async function initializeRuleManagerAsync(context: vscode.ExtensionContext): Promise<void> {
    try {
        globalRuleManager = new RuleManager(context);
        await globalRuleManager.initialize();
        Logger.info('RuleManager initialized successfully');
    } catch (error) {
        Logger.error('RuleManager initialization failed, will create on-demand', error as Error);
        globalRuleManager = undefined;
    }
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
    try {
        Logger.info('Deactivating Copilot Memory extension...');
        // Cleanup resources if needed
    } catch (error) {
        Logger.error('Error during extension deactivation', error as Error);
    }
}
