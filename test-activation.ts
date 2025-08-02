import * as vscode from 'vscode';

// Test extension activation scenarios
export function testActivationScenarios() {
    console.log('=== Testing Extension Activation Scenarios ===');

    // Test 1: Basic workspace access
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        console.log('✓ Workspace folders access:', workspaceFolders ? workspaceFolders.length : 0);
    } catch (error) {
        console.error('✗ Error accessing workspace folders:', error);
    }

    // Test 2: Configuration access
    try {
        const config = vscode.workspace.getConfiguration('slim');
        console.log('✓ Slim configuration access:', !!config);
    } catch (error) {
        console.error('✗ Error accessing slim configuration:', error);
    }

    // Test 3: Workspace name
    try {
        const workspaceName = vscode.workspace.name;
        console.log('✓ Workspace name:', workspaceName);
    } catch (error) {
        console.error('✗ Error accessing workspace name:', error);
    }

    // Test 4: Workspace file
    try {
        const workspaceFile = vscode.workspace.workspaceFile;
        console.log('✓ Workspace file:', workspaceFile);
    } catch (error) {
        console.error('✗ Error accessing workspace file:', error);
    }

    console.log('=== Activation Tests Complete ===');
}

// Test formatter registration
export function testFormatterRegistration() {
    console.log('=== Testing Formatter Registration ===');

    try {
        // Test if we can register a formatter
        const disposable = vscode.languages.registerDocumentFormattingEditProvider(
            { language: 'slim' },
            {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    console.log('✓ Formatter called for:', document.fileName);
                    return [];
                }
            }
        );

        console.log('✓ Formatter registration successful');
        disposable.dispose();
    } catch (error) {
        console.error('✗ Error registering formatter:', error);
    }

    console.log('=== Formatter Registration Tests Complete ===');
}