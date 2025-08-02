import * as vscode from 'vscode';

// Minimal extension to test for NoWorkspaceUriError
export function activate(context: vscode.ExtensionContext) {
    console.log('Minimal extension activated');

    // Test 1: Basic activation without workspace access
    console.log('✓ Extension activated successfully');

    // Test 2: Deferred workspace access
    const testWorkspaceCommand = vscode.commands.registerCommand('test.workspace', () => {
        try {
            console.log('Testing workspace access...');
            const folders = vscode.workspace.workspaceFolders;
            console.log('Workspace folders:', folders);
            vscode.window.showInformationMessage('Workspace test completed');
        } catch (error) {
            console.error('Workspace test error:', error);
            vscode.window.showErrorMessage('Workspace test failed: ' + error.message);
        }
    });

    context.subscriptions.push(testWorkspaceCommand);
}

export function deactivate() {
    console.log('Minimal extension deactivated');
}