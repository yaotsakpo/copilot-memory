import * as vscode from 'vscode';
import { RuleManager } from './ruleManager';

export class CopilotInterceptor {
    private ruleManager: RuleManager;
    private disposables: vscode.Disposable[] = [];

    constructor(ruleManager: RuleManager) {
        this.ruleManager = ruleManager;
    }

    async initialize(): Promise<void> {
        // Note: This is a simplified implementation
        // In a real-world scenario, you would need to:
        // 1. Hook into Copilot's completion provider
        // 2. Intercept requests before they go to Copilot
        // 3. Inject custom rules into the context

        // For now, we'll register our own completion provider as a demonstration
        this.registerCompletionProvider();

        // Also listen for document changes to potentially inject rules
        this.listenForDocumentChanges();
    }

    private registerCompletionProvider(): void {
        // Register a completion provider that can work alongside Copilot
        const provider = vscode.languages.registerCompletionItemProvider(
            { scheme: 'file' },
            {
                provideCompletionItems: async (
                    document: vscode.TextDocument,
                    position: vscode.Position,
                    token: vscode.CancellationToken,
                    context: vscode.CompletionContext
                ): Promise<vscode.CompletionItem[]> => {
                    // Get active rules for the current language
                    const languageId = document.languageId;
                    const rules = await this.ruleManager.getActiveRulesForContext(languageId);

                    // Create completion items that represent our rules
                    const completionItems: vscode.CompletionItem[] = [];

                    // Add a special completion item that shows active rules
                    if (rules.length > 0) {
                        const ruleItem = new vscode.CompletionItem(
                            '💡 Copilot Memory Rules',
                            vscode.CompletionItemKind.Text
                        );
                        ruleItem.detail = `${rules.length} active rule(s)`;
                        ruleItem.documentation = new vscode.MarkdownString(
                            `**Active Rules:**\n\n${rules.map((rule: string) => `• ${rule}`).join('\n\n')}`
                        );
                        ruleItem.sortText = '0'; // Sort to top
                        completionItems.push(ruleItem);
                    }

                    return completionItems;
                }
            },
            '.' // Trigger on dot
        );

        this.disposables.push(provider);
    }

    private listenForDocumentChanges(): void {
        // Listen for text document changes to potentially inject rules
        const changeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
            // This is where you could implement rule injection logic
            // For example, you might want to show rule suggestions as the user types
            const document = event.document;
            const languageId = document.languageId;

            // Get rules for this context
            const rules = await this.ruleManager.getActiveRulesForContext(languageId);

            // In a real implementation, you would:
            // 1. Analyze the current context
            // 2. Check if any rules apply
            // 3. Potentially show hints or modify Copilot requests

            if (rules.length > 0) {
                // Could show status bar item or other UI indication
                this.updateStatusBar(rules.length);
            }
        });

        this.disposables.push(changeListener);
    }

    private updateStatusBar(ruleCount: number): void {
        // Create or update status bar item
        const statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );

        statusBarItem.text = `$(lightbulb) ${ruleCount} Rules`;
        statusBarItem.tooltip = `Copilot Memory: ${ruleCount} active rule(s)`;
        statusBarItem.command = 'copilotMemory.listRules';
        statusBarItem.show();

        this.disposables.push(statusBarItem);
    }

    // Method to inject rules into a prompt (this would be called by Copilot integration)
    async injectRulesIntoPrompt(originalPrompt: string, languageId?: string): Promise<string> {
        const rules = await this.ruleManager.getActiveRulesForContext(languageId);

        if (rules.length === 0) {
            return originalPrompt;
        }

        const ruleContext = rules.map(rule => `- ${rule}`).join('\n');
        const enhancedPrompt = `Please follow these rules when generating code:
${ruleContext}

${originalPrompt}`;

        return enhancedPrompt;
    }

    dispose(): void {
        this.disposables.forEach(disposable => disposable.dispose());
        this.disposables = [];
    }
}
