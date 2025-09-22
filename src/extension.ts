import * as vscode from 'vscode';
import { CommandRegistry } from './commands/commandRegistry';
import { RuleManager } from './ruleManager';
import { Logger } from './utils/logger';
import { ConfigValidator } from './utils/configValidator';
import { EXTENSION_CONFIG } from './constants';
import { ExtensionAPI, CopilotMemoryAPI } from './api/extensionAPI';

/**
 * This method is called when your extension is activated
 * Your extension is activated the very first time the command is executed
 */
export async function activate(context: vscode.ExtensionContext) {
    try {
        Logger.info('Activating Copilot Memory extension...');

        // Validate configuration
        const configValidation = ConfigValidator.validateCurrentConfig();
        if (!configValidation.isValid) {
            ConfigValidator.showValidationErrors(configValidation.errors);
            // Continue with safe defaults
        }

        // Start configuration watcher
        ConfigValidator.startConfigWatcher(context);

        // Initialize RuleManager with context
        const ruleManager = new RuleManager(context);
        await ruleManager.initialize();

        // Initialize and register all commands
        const commandRegistry = new CommandRegistry(ruleManager);
        commandRegistry.registerCommands(context);

        // Create and expose public API
        const packageJson = require('../package.json');
        const extensionAPI = new ExtensionAPI(ruleManager, packageJson.version);

        // Store API and ruleManager in context for cleanup and external access
        context.subscriptions.push({
            dispose: () => {
                extensionAPI.dispose();
                ruleManager.dispose();
            }
        });

        Logger.info('Copilot Memory extension activated successfully');
        
        // Export API for other extensions
        return extensionAPI;
    } catch (error) {
        Logger.error('Failed to activate Copilot Memory extension', error as Error);
        vscode.window.showErrorMessage('Failed to activate Copilot Memory extension. Please check the logs for details.');
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
