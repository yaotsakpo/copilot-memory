import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start extension tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('yaotsakpo.copilot-memory'));
	});

	test('Extension should activate', async () => {
		const extension = vscode.extensions.getExtension('yaotsakpo.copilot-memory');
		if (extension && !extension.isActive) {
			await extension.activate();
		}
		assert.ok(extension?.isActive, 'Extension should be active');
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);

		assert.ok(
			commands.includes('copilotMemory.addRule'),
			'copilotMemory.addRule command should be registered'
		);
		assert.ok(
			commands.includes('copilotMemory.listRules'),
			'copilotMemory.listRules command should be registered'
		);
		assert.ok(
			commands.includes('copilotMemory.removeRule'),
			'copilotMemory.removeRule command should be registered'
		);
	});
});
