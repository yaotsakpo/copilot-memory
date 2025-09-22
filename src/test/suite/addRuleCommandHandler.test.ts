import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { AddRuleCommandHandler } from '../../commands/addRuleCommand';
import { RuleManager } from '../../ruleManager';
import { Logger } from '../../utils/logger';

suite('AddRuleCommandHandler Tests', () => {
    let handler: AddRuleCommandHandler;
    let ruleManagerStub: sinon.SinonStubbedInstance<RuleManager>;
    let showInputBoxStub: sinon.SinonStub;
    let showQuickPickStub: sinon.SinonStub;
    let showInformationMessageStub: sinon.SinonStub;
    let showErrorMessageStub: sinon.SinonStub;
    let loggerInfoStub: sinon.SinonStub;
    let loggerErrorStub: sinon.SinonStub;

    setup(() => {
        // Create stubbed RuleManager
        ruleManagerStub = sinon.createStubInstance(RuleManager);

        // Stub VS Code APIs
        showInputBoxStub = sinon.stub(vscode.window, 'showInputBox');
        showQuickPickStub = sinon.stub(vscode.window, 'showQuickPick');
        showInformationMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        showErrorMessageStub = sinon.stub(vscode.window, 'showErrorMessage');

        // Stub Logger
        loggerInfoStub = sinon.stub(Logger, 'info');
        loggerErrorStub = sinon.stub(Logger, 'error');

        handler = new AddRuleCommandHandler(ruleManagerStub);
    });

    teardown(() => {
        sinon.restore();
    });

    suite('execute', () => {
        test('should successfully add a global rule', async () => {
            // Setup stubs
            showInputBoxStub.resolves('Always use const instead of let');
            showQuickPickStub.resolves({ label: 'Global', value: 'global' });
            ruleManagerStub.addRule.resolves();

            // Execute command
            await handler.execute();

            // Verify calls
            assert.ok(showInputBoxStub.calledOnce, 'Should prompt for rule text');
            assert.ok(showQuickPickStub.calledOnce, 'Should prompt for scope');
            assert.ok(ruleManagerStub.addRule.calledOnce, 'Should call addRule');
            assert.ok(showInformationMessageStub.calledOnce, 'Should show success message');
            assert.ok(loggerInfoStub.calledOnce, 'Should log success');

            // Verify rule manager was called with correct parameters
            const addRuleCall = ruleManagerStub.addRule.firstCall;
            assert.strictEqual(addRuleCall.args[0], 'Always use const instead of let');
            assert.strictEqual(addRuleCall.args[1], 'global');
        });

        test('should handle user cancellation at rule text input', async () => {
            showInputBoxStub.resolves(undefined); // User cancelled

            await handler.execute();

            assert.ok(showInputBoxStub.calledOnce);
            assert.ok(showQuickPickStub.notCalled, 'Should not proceed to scope selection');
            assert.ok(ruleManagerStub.addRule.notCalled, 'Should not add rule');
            assert.ok(showInformationMessageStub.notCalled, 'Should not show success message');
        });

        test('should handle user cancellation at scope selection', async () => {
            showInputBoxStub.resolves('Test rule');
            showQuickPickStub.resolves(undefined); // User cancelled

            await handler.execute();

            assert.ok(showInputBoxStub.calledOnce);
            assert.ok(showQuickPickStub.calledOnce);
            assert.ok(ruleManagerStub.addRule.notCalled, 'Should not add rule');
            assert.ok(showInformationMessageStub.notCalled, 'Should not show success message');
        });

        test('should handle empty rule text', async () => {
            showInputBoxStub.resolves('   '); // Empty/whitespace text
            showQuickPickStub.resolves({ label: 'Global', value: 'global' });

            await handler.execute();

            assert.ok(showErrorMessageStub.calledOnce, 'Should show error message');
            assert.ok(ruleManagerStub.addRule.notCalled, 'Should not add rule');
        });

        test('should handle rule text that is too long', async () => {
            const longText = 'A'.repeat(501); // Exceeds 500 character limit
            showInputBoxStub.resolves(longText);
            showQuickPickStub.resolves({ label: 'Global', value: 'global' });

            await handler.execute();

            assert.ok(showErrorMessageStub.calledOnce, 'Should show error message');
            assert.ok(ruleManagerStub.addRule.notCalled, 'Should not add rule');
        });

        test('should handle RuleManager errors', async () => {
            showInputBoxStub.resolves('Valid rule text');
            showQuickPickStub.resolves({ label: 'Global', value: 'global' });

            const testError = new Error('Database connection failed');
            ruleManagerStub.addRule.rejects(testError);

            await handler.execute();

            assert.ok(showErrorMessageStub.calledOnce, 'Should show error message');
            assert.ok(loggerErrorStub.calledOnce, 'Should log error');

            // Verify error was logged with correct message and error object
            const loggerCall = loggerErrorStub.firstCall;
            assert.ok(loggerCall.args[0].includes('Failed to add rule'));
            assert.strictEqual(loggerCall.args[1], testError);
        });

        test('should add project-scoped rule', async () => {
            showInputBoxStub.resolves('Project specific rule');
            showQuickPickStub.resolves({ label: 'Current Project', value: 'project' });
            ruleManagerStub.addRule.resolves();

            await handler.execute();

            const addRuleCall = ruleManagerStub.addRule.firstCall;
            assert.strictEqual(addRuleCall.args[1], 'project');
        });

        test('should add language-scoped rule', async () => {
            showInputBoxStub.resolves('TypeScript specific rule');
            showQuickPickStub.resolves({ label: 'Current Language (typescript)', value: 'language:typescript' });
            ruleManagerStub.addRule.resolves();

            await handler.execute();

            const addRuleCall = ruleManagerStub.addRule.firstCall;
            assert.strictEqual(addRuleCall.args[1], 'language:typescript');
        });
    });

    suite('input validation', () => {
        test('should trim whitespace from rule text', async () => {
            showInputBoxStub.resolves('  Trimmed rule  ');
            showQuickPickStub.resolves({ label: 'Global', value: 'global' });
            ruleManagerStub.addRule.resolves();

            await handler.execute();

            const addRuleCall = ruleManagerStub.addRule.firstCall;
            assert.strictEqual(addRuleCall.args[0], 'Trimmed rule');
        });
    });
});
