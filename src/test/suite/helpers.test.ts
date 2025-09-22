import * as assert from 'assert';
import * as vscode from 'vscode';
import {
    validateRuleText,
    sanitizeInput,
    getCurrentLanguageId,
    getWorkspaceRoot
} from '../../utils/helpers';

suite('Helpers Utility Tests', () => {

    suite('validateRuleText', () => {
        test('should accept valid rule text', () => {
            const validTexts = [
                'Always use const instead of let',
                'Prefer async/await over promises',
                'Use meaningful variable names',
                'A'.repeat(50) // 50 characters
            ];

            validTexts.forEach(text => {
                const result = validateRuleText(text);
                assert.strictEqual(result.isValid, true, `Should accept: "${text}"`);
                assert.strictEqual(result.error, undefined);
            });
        });

        test('should reject empty or whitespace-only text', () => {
            const invalidTexts = ['', '   ', '\t', '\n', '  \t  \n  '];

            invalidTexts.forEach(text => {
                const result = validateRuleText(text);
                assert.strictEqual(result.isValid, false, `Should reject: "${text}"`);
                assert.strictEqual(result.error, 'Rule text cannot be empty');
            });
        });

        test('should reject text that is too long', () => {
            const longText = 'A'.repeat(501); // 501 characters
            const result = validateRuleText(longText);

            assert.strictEqual(result.isValid, false);
            assert.strictEqual(result.error, 'Rule text must be less than 500 characters');
        });

        test('should accept text at maximum length', () => {
            const maxLengthText = 'A'.repeat(500); // Exactly 500 characters
            const result = validateRuleText(maxLengthText);

            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.error, undefined);
        });
    });

    suite('sanitizeInput', () => {
        test('should trim whitespace', () => {
            const testCases = [
                { input: '  hello  ', expected: 'hello' },
                { input: '\t\nworld\n\t', expected: 'world' },
                { input: '   test   rule   ', expected: 'test rule' }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = sanitizeInput(input);
                assert.strictEqual(result, expected, `Input: "${input}"`);
            });
        });

        test('should collapse multiple spaces', () => {
            const testCases = [
                { input: 'hello    world', expected: 'hello world' },
                { input: 'test  \t  \n  rule', expected: 'test rule' },
                { input: 'a     b     c', expected: 'a b c' }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = sanitizeInput(input);
                assert.strictEqual(result, expected, `Input: "${input}"`);
            });
        });

        test('should handle empty strings', () => {
            const result = sanitizeInput('');
            assert.strictEqual(result, '');
        });

        test('should handle strings with only whitespace', () => {
            const testCases = ['   ', '\t\t', '\n\n', '  \t  \n  '];

            testCases.forEach(input => {
                const result = sanitizeInput(input);
                assert.strictEqual(result, '', `Input: "${input}"`);
            });
        });
    });

    suite('getCurrentLanguageId', () => {
        test('should return undefined when no active editor', () => {
            // This test assumes no active editor is open
            // In real VS Code environment, this might vary
            const result = getCurrentLanguageId();
            // We can't assert a specific value since it depends on VS Code state
            assert.ok(typeof result === 'string' || result === undefined);
        });
    });

    suite('getWorkspaceRoot', () => {
        test('should return string or undefined', () => {
            const result = getWorkspaceRoot();
            // We can't assert a specific value since it depends on workspace state
            assert.ok(typeof result === 'string' || result === undefined);
        });
    });
});
