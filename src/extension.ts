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

    // Add commands to context immediately
    context.subscriptions.push(addRuleCommand, listRulesCommand, removeRuleCommand);
    console.log('Commands registered: copilotMemory.addRule, copilotMemory.listRules, copilotMemory.removeRule');
}

/**
 * This method is called when your extension is deactivated
 */
export function deactivate() {
    console.log('Deactivating Copilot Memory extension...');
}
