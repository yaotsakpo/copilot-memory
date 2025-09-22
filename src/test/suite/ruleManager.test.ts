import * as assert from 'assert';
import * as vscode from 'vscode';
import { RuleManager, Rule } from '../../ruleManager';

suite('RuleManager Test Suite', () => {
	vscode.window.showInformationMessage('Start RuleManager tests.');

	let ruleManager: RuleManager;
	let mockContext: vscode.ExtensionContext;

	setup(async function() {
		this.timeout(5000); // Reduce timeout
		// Create a minimal mock extension context
		mockContext = {
			subscriptions: [],
			globalStorageUri: vscode.Uri.file('/tmp/test-storage'),
		} as any;

		// Mock the configuration to avoid MongoDB in tests
		const mockConfig = {
			get: (key: string) => {
				if (key === 'mongodbUri') {
					return undefined;
				}
				if (key === 'fallbackToLocal') {
					return true;
				}
				return undefined;
			}
		};
		
		// Override workspace configuration for tests
		const originalGetConfiguration = vscode.workspace.getConfiguration;
		vscode.workspace.getConfiguration = () => mockConfig as any;

		ruleManager = new RuleManager(mockContext);
		await ruleManager.initialize();
		
		// Restore original configuration
		vscode.workspace.getConfiguration = originalGetConfiguration;
	});

	test('should initialize successfully', () => {
		assert.ok(ruleManager, 'RuleManager should be created');
	});

	test('should add a global rule successfully', async () => {
		await ruleManager.addRule('Always use const instead of let', 'global');

		const rules = await ruleManager.getRules('global');
		assert.ok(rules.length > 0, 'Should have at least one rule');

		const addedRule = rules.find(r => r.ruleText === 'Always use const instead of let');
		assert.ok(addedRule, 'Should find the added rule');
		assert.strictEqual(addedRule.scope, 'global', 'Rule scope should be global');
	});

	test('should retrieve all rules', async () => {
		// Add a test rule
		await ruleManager.addRule('Use async/await instead of .then()', 'global');

		const rules = await ruleManager.getRules();
		assert.ok(Array.isArray(rules), 'Should return an array');
		assert.ok(rules.length > 0, 'Should have at least one rule');

		const foundRule = rules.find(r => r.ruleText === 'Use async/await instead of .then()');
		assert.ok(foundRule, 'Should find the added rule');
	});

	test('should handle language-specific rules', async () => {
		await ruleManager.addRule('Use interfaces instead of type aliases', 'language', 'typescript');

		const rules = await ruleManager.getRules('language', 'typescript');
		assert.ok(rules.length > 0, 'Should have at least one language rule');

		const languageRule = rules.find(r => r.ruleText === 'Use interfaces instead of type aliases');
		assert.ok(languageRule, 'Should find the language-specific rule');
		assert.strictEqual(languageRule.scope, 'language', 'Rule scope should be language');
		assert.strictEqual(languageRule.languageScope, 'typescript', 'Language scope should be typescript');
	});

	test('should remove rules', async () => {
		// Add a rule
		await ruleManager.addRule('Test rule to be removed', 'global');

		let rules = await ruleManager.getRules();
		const ruleToRemove = rules.find(r => r.ruleText === 'Test rule to be removed');
		assert.ok(ruleToRemove, 'Rule should exist before removal');

		// Remove the rule
		await ruleManager.removeRule(ruleToRemove.ruleId);

		// Verify it's gone
		rules = await ruleManager.getRules();
		const removedRule = rules.find(r => r.ruleId === ruleToRemove.ruleId);
		assert.strictEqual(removedRule, undefined, 'Rule should be removed');
	});

	test('should get active rules for context', async () => {
		// Add different types of rules
		await ruleManager.addRule('Global rule', 'global');
		await ruleManager.addRule('TypeScript rule', 'language', 'typescript');
		await ruleManager.addRule('JavaScript rule', 'language', 'javascript');

		// Get rules for TypeScript context
		const tsRules = await ruleManager.getActiveRulesForContext('typescript');
		assert.ok(tsRules.length >= 2, 'Should include global and TypeScript rules');
		assert.ok(tsRules.includes('Global rule'), 'Should include global rule');
		assert.ok(tsRules.includes('TypeScript rule'), 'Should include TypeScript rule');
		assert.ok(!tsRules.includes('JavaScript rule'), 'Should not include JavaScript rule');
	});
});
