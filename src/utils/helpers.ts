import * as vscode from 'vscode';

/**
 * Utility functions for the Copilot Memory extension
 */

/**
 * Get the current active document's language ID
 */
export function getCurrentLanguageId(): string | undefined {
    return vscode.window.activeTextEditor?.document.languageId;
}

/**
 * Get the current workspace root path
 */
export function getWorkspaceRoot(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

/**
 * Show an error message with optional actions
 */
export async function showErrorMessage(
    message: string, 
    ...actions: string[]
): Promise<string | undefined> {
    return vscode.window.showErrorMessage(message, ...actions);
}

/**
 * Show an information message with optional actions
 */
export async function showInformationMessage(
    message: string, 
    ...actions: string[]
): Promise<string | undefined> {
    return vscode.window.showInformationMessage(message, ...actions);
}

/**
 * Validate rule text input
 */
export function validateRuleText(text: string): { isValid: boolean; error?: string } {
    if (!text || text.trim().length === 0) {
        return { isValid: false, error: 'Rule text cannot be empty' };
    }
    
    if (text.length > 500) {
        return { isValid: false, error: 'Rule text must be less than 500 characters' };
    }
    
    return { isValid: true };
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
}
