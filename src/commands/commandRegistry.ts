import * as vscode from 'vscode';
import { RuleManager } from '../ruleManager';
import { AddRuleCommandHandler } from './addRuleCommand';
import { ListRulesCommandHandler } from './listRulesCommand';
import { RemoveRuleCommandHandler, BulkRuleCommandHandler } from './removeRuleCommand';
import { COMMANDS } from '../constants';
import { Logger } from '../utils/logger';

/**
 * Registry for all extension commands
 */
export class CommandRegistry {
    private addRuleHandler: AddRuleCommandHandler;
    private listRulesHandler: ListRulesCommandHandler;
    private removeRuleHandler: RemoveRuleCommandHandler;
    private bulkRuleHandler: BulkRuleCommandHandler;

    constructor(private ruleManager: RuleManager) {
        this.addRuleHandler = new AddRuleCommandHandler(ruleManager);
        this.listRulesHandler = new ListRulesCommandHandler(ruleManager);
        this.removeRuleHandler = new RemoveRuleCommandHandler(ruleManager);
        this.bulkRuleHandler = new BulkRuleCommandHandler(ruleManager);
    }

    /**
     * Register all commands with VS Code
     */
    registerCommands(context: vscode.ExtensionContext): void {
        const commands = [
            // Core commands
            {
                command: COMMANDS.addRule,
                handler: () => this.addRuleHandler.execute(),
                title: 'Add Rule'
            },
            {
                command: COMMANDS.listRules,
                handler: () => this.listRulesHandler.execute(),
                title: 'List Rules'
            },
            {
                command: COMMANDS.removeRule,
                handler: () => this.removeRuleHandler.execute(),
                title: 'Remove Rule'
            },
            // Additional commands
            {
                command: `${COMMANDS.removeRule}.all`,
                handler: () => this.bulkRuleHandler.removeAllRules(),
                title: 'Remove All Rules'
            },
            {
                command: `${COMMANDS.listRules}.export`,
                handler: () => this.bulkRuleHandler.exportRules(),
                title: 'Export Rules'
            },
            // Developer commands
            {
                command: `${COMMANDS.addRule}.showLogs`,
                handler: () => Logger.show(),
                title: 'Show Copilot Memory Logs'
            }
        ];

        // Register each command
        commands.forEach(({ command, handler, title }) => {
            const disposable = vscode.commands.registerCommand(command, async () => {
                try {
                    Logger.info(`Executing command: ${title}`);
                    await handler();
                } catch (error) {
                    const errorMessage = `Command failed: ${title}`;
                    Logger.error(errorMessage, error as Error);
                    vscode.window.showErrorMessage(`${errorMessage}: ${error}`);
                }
            });

            context.subscriptions.push(disposable);
            Logger.info(`Registered command: ${command}`);
        });

        Logger.info(`Successfully registered ${commands.length} commands`);
    }
}
