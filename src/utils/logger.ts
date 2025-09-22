import * as vscode from 'vscode';

/**
 * Logger utility for the Copilot Memory extension
 */
export class Logger {
    private static readonly outputChannel = vscode.window.createOutputChannel('Copilot Memory');

    /**
     * Log an informational message
     */
    static info(message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] INFO: ${message}`;
        console.log(formattedMessage, ...args);
        this.outputChannel.appendLine(formattedMessage);
    }

    /**
     * Log a warning message
     */
    static warn(message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] WARN: ${message}`;
        console.warn(formattedMessage, ...args);
        this.outputChannel.appendLine(formattedMessage);
    }

    /**
     * Log an error message
     */
    static error(message: string, error?: Error, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] ERROR: ${message}`;
        console.error(formattedMessage, error, ...args);
        this.outputChannel.appendLine(formattedMessage);
        if (error) {
            this.outputChannel.appendLine(`Stack: ${error.stack}`);
        }
    }

    /**
     * Show the output channel
     */
    static show(): void {
        this.outputChannel.show();
    }

    /**
     * Clear the output channel
     */
    static clear(): void {
        this.outputChannel.clear();
    }
}
