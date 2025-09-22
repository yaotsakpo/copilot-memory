# Copilot Memory API Documentation

This document provides comprehensive documentation for the Copilot Memory extension API, designed for third-party extensions that want to integrate with Copilot Memory.

## Table of Contents

- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Types and Interfaces](#types-and-interfaces)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)

## Getting Started

### Installation and Setup

First, ensure Copilot Memory is installed and activated:

```typescript
import * as vscode from 'vscode';
import { CopilotMemoryAPI } from './types/copilotMemoryAPI';

export async function activate(context: vscode.ExtensionContext) {
    // Get Copilot Memory extension
    const extension = vscode.extensions.getExtension('yaotsakpo.copilot-memory');

    if (!extension) {
        vscode.window.showErrorMessage('Copilot Memory extension is required');
        return;
    }

    // Activate if not already active
    if (!extension.isActive) {
        await extension.activate();
    }

    // Get the API
    const api: CopilotMemoryAPI = extension.exports;

    // Your integration code here...
}
```

### Helper Function

Use the provided helper function for easier API access:

```typescript
import { getCopilotMemoryAPI } from './types/copilotMemoryAPI';

const api = await getCopilotMemoryAPI();
if (api) {
    // API is available
    console.log(`Copilot Memory v${api.getVersion()} is ready`);
}
```

## API Reference

### Rule Management

#### `addRule(ruleText, scope, options?)`

Add a new rule to Copilot Memory.

**Parameters:**
- `ruleText` (string): The rule text (1-500 characters)
- `scope` ('global' | 'project' | 'language'): Rule scope
- `options` (object, optional):
  - `languageScope` (string): Required for language-scoped rules
  - `projectPath` (string): Custom project path (defaults to current workspace)
  - `isActive` (boolean): Whether rule is active (default: true)

**Returns:** `Promise<string>` - The new rule ID

**Example:**
```typescript
// Global rule
const globalRuleId = await api.addRule(
    'Always use TypeScript strict mode',
    'global'
);

// Language-specific rule
const tsRuleId = await api.addRule(
    'Prefer interfaces over type aliases',
    'language',
    { languageScope: 'typescript' }
);

// Project-specific rule with custom path
const projectRuleId = await api.addRule(
    'Use our custom Logger class',
    'project',
    { projectPath: '/path/to/project' }
);
```

#### `removeRule(ruleId)`

Remove a rule by its ID.

**Parameters:**
- `ruleId` (string): The rule ID to remove

**Returns:** `Promise<boolean>` - True if removed, false if not found

**Example:**
```typescript
const success = await api.removeRule('rule-id-123');
if (success) {
    console.log('Rule removed successfully');
}
```

#### `getRules(filters?)`

Get rules matching the specified criteria.

**Parameters:**
- `filters` (object, optional):
  - `scope` ('global' | 'project' | 'language'): Filter by scope
  - `languageId` (string): Filter by language ID
  - `projectPath` (string): Filter by project path
  - `isActive` (boolean): Filter by active status

**Returns:** `Promise<Rule[]>` - Array of matching rules

**Example:**
```typescript
// Get all active global rules
const globalRules = await api.getRules({
    scope: 'global',
    isActive: true
});

// Get all TypeScript rules
const tsRules = await api.getRules({
    scope: 'language',
    languageId: 'typescript'
});

// Get all rules (no filters)
const allRules = await api.getRules();
```

#### `getActiveRulesForContext(languageId?)`

Get active rules for the current context.

**Parameters:**
- `languageId` (string, optional): Language ID to filter by

**Returns:** `Promise<string[]>` - Array of rule texts

**Example:**
```typescript
// Get all active rules for current context
const activeRules = await api.getActiveRulesForContext();

// Get active TypeScript rules
const tsActiveRules = await api.getActiveRulesForContext('typescript');
```

### Custom Scopes

#### `registerCustomScope(scopeName, validator)`

Register a custom rule scope with validation logic.

**Parameters:**
- `scopeName` (string): Unique scope name (cannot override built-in scopes)
- `validator` (function): Validation function that returns boolean

**Example:**
```typescript
// Register scope for test files
api.registerCustomScope('test-files', (context) => {
    return context.filePath?.includes('.test.') ||
           context.filePath?.includes('.spec.') ||
           context.filePath?.includes('__tests__');
});

// Register scope for configuration files
api.registerCustomScope('config-files', (context) => {
    const configPatterns = ['.json', '.yaml', '.yml', '.toml', '.env'];
    return configPatterns.some(pattern =>
        context.filePath?.endsWith(pattern)
    );
});
```

### Event Handling

#### `onRuleChanged(listener)`

Subscribe to rule change events.

**Parameters:**
- `listener` (function): Event handler function

**Returns:** `vscode.Disposable` - Disposable to unsubscribe

**Example:**
```typescript
const disposable = api.onRuleChanged(event => {
    console.log(`Rule ${event.type}: ${event.ruleId}`);

    switch (event.type) {
        case 'added':
            vscode.window.showInformationMessage(
                `New rule added: ${event.rule?.ruleText}`
            );
            break;
        case 'removed':
            console.log(`Rule ${event.ruleId} was removed`);
            break;
    }
});

// Don't forget to dispose when done
context.subscriptions.push(disposable);
```

### Utility Methods

#### `getVersion()`

Get the extension version.

**Returns:** `string` - Version string

**Example:**
```typescript
const version = api.getVersion();
console.log(`Using Copilot Memory v${version}`);
```

#### `isMongoConnected()`

Check if MongoDB is currently connected.

**Returns:** `boolean` - Connection status

**Example:**
```typescript
const isConnected = api.isMongoConnected();
console.log(`MongoDB: ${isConnected ? 'Connected' : 'Offline'}`);
```

## Types and Interfaces

### Rule Interface

```typescript
interface Rule {
    ruleId: string;
    ruleText: string;
    scope: 'global' | 'project' | 'language';
    languageScope?: string;
    projectPath?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}
```

### Rule Change Event

```typescript
type RuleChangeEventType = 'added' | 'removed' | 'updated' | 'activated' | 'deactivated';

interface RuleChangeEvent {
    type: RuleChangeEventType;
    ruleId: string;
    rule?: Rule;
    timestamp: Date;
}
```

### Custom Scope Validator

```typescript
type CustomScopeValidator = (context: {
    languageId?: string;
    projectPath?: string;
    filePath?: string;
    workspaceRoot?: string;
}) => boolean;
```

## Examples

### Team Rules Synchronization

```typescript
export class TeamRulesSync {
    private api: CopilotMemoryAPI;
    private disposables: vscode.Disposable[] = [];

    constructor(api: CopilotMemoryAPI) {
        this.api = api;
        this.setupEventHandlers();
    }

    async syncTeamRules() {
        // Fetch team rules from your API/config
        const teamRules = await this.fetchTeamRules();

        for (const teamRule of teamRules) {
            try {
                await this.api.addRule(
                    teamRule.text,
                    teamRule.scope,
                    teamRule.options
                );
                console.log(`Synced team rule: ${teamRule.text}`);
            } catch (error) {
                console.error(`Failed to sync rule: ${error}`);
            }
        }
    }

    private setupEventHandlers() {
        // Monitor rule changes
        const changeHandler = this.api.onRuleChanged(event => {
            if (event.type === 'added') {
                this.reportRuleUsage(event.ruleId, event.rule?.ruleText);
            }
        });

        this.disposables.push(changeHandler);
    }

    private async fetchTeamRules(): Promise<TeamRule[]> {
        // Your implementation to fetch team rules
        return [];
    }

    private reportRuleUsage(ruleId: string, ruleText?: string) {
        // Report rule usage to analytics
        console.log(`Rule used: ${ruleId} - ${ruleText}`);
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
```

### Rule Quality Analyzer

```typescript
export class RuleQualityAnalyzer {
    private api: CopilotMemoryAPI;

    constructor(api: CopilotMemoryAPI) {
        this.api = api;
    }

    async analyzeRuleQuality() {
        const allRules = await this.api.getRules();
        const analysis = {
            totalRules: allRules.length,
            activeRules: allRules.filter(r => r.isActive).length,
            scopeDistribution: this.analyzeScopeDistribution(allRules),
            duplicates: this.findDuplicateRules(allRules),
            qualityScore: this.calculateQualityScore(allRules)
        };

        return analysis;
    }

    private analyzeScopeDistribution(rules: Rule[]) {
        return {
            global: rules.filter(r => r.scope === 'global').length,
            project: rules.filter(r => r.scope === 'project').length,
            language: rules.filter(r => r.scope === 'language').length
        };
    }

    private findDuplicateRules(rules: Rule[]): Rule[] {
        const seen = new Set<string>();
        const duplicates: Rule[] = [];

        for (const rule of rules) {
            const key = `${rule.scope}-${rule.ruleText.toLowerCase()}`;
            if (seen.has(key)) {
                duplicates.push(rule);
            } else {
                seen.add(key);
            }
        }

        return duplicates;
    }

    private calculateQualityScore(rules: Rule[]): number {
        if (rules.length === 0) return 0;

        let score = 100;
        const duplicates = this.findDuplicateRules(rules);
        const inactiveRules = rules.filter(r => !r.isActive);

        // Penalize duplicates and inactive rules
        score -= (duplicates.length / rules.length) * 20;
        score -= (inactiveRules.length / rules.length) * 10;

        return Math.max(0, Math.round(score));
    }
}
```

## Best Practices

### 1. Error Handling

Always wrap API calls in try-catch blocks:

```typescript
try {
    const ruleId = await api.addRule('My rule', 'global');
    console.log(`Rule added with ID: ${ruleId}`);
} catch (error) {
    console.error('Failed to add rule:', error);
    vscode.window.showErrorMessage(`Failed to add rule: ${error.message}`);
}
```

### 2. Resource Cleanup

Dispose of event subscriptions properly:

```typescript
export function activate(context: vscode.ExtensionContext) {
    const api = await getCopilotMemoryAPI();

    const disposable = api.onRuleChanged(event => {
        // Handle event
    });

    // Register for cleanup
    context.subscriptions.push(disposable);
}
```

### 3. Batch Operations

For multiple operations, consider batching:

```typescript
async function addMultipleRules(rules: Array<{text: string, scope: string}>) {
    const results = await Promise.allSettled(
        rules.map(rule => api.addRule(rule.text, rule.scope as any))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Added ${successful} rules, ${failed} failed`);
}
```

### 4. Validation

Validate input before API calls:

```typescript
function validateRuleText(text: string): boolean {
    return text &&
           text.trim().length > 0 &&
           text.length <= 500;
}

async function safeAddRule(text: string, scope: string) {
    if (!validateRuleText(text)) {
        throw new Error('Invalid rule text');
    }

    return api.addRule(text, scope as any);
}
```

## Error Handling

### Common Errors

1. **Rule text validation errors**
   - Empty or whitespace-only text
   - Text exceeding 500 characters

2. **Scope validation errors**
   - Missing `languageScope` for language-scoped rules
   - Invalid scope names for custom scopes

3. **Connection errors**
   - MongoDB connection issues
   - Network timeouts

4. **Permission errors**
   - Insufficient workspace permissions
   - File system access denied

### Error Recovery

```typescript
async function resilientAddRule(text: string, scope: string, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await api.addRule(text, scope as any);
        } catch (error) {
            console.warn(`Attempt ${attempt} failed:`, error);

            if (attempt === maxRetries) {
                throw error;
            }

            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
```

This completes the comprehensive API documentation for Copilot Memory. Use this guide to build powerful integrations with the extension's capabilities.
