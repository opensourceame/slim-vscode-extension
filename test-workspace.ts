import * as vscode from 'vscode';

// Test workspace scenarios
function testWorkspaceScenarios() {
    console.log('=== Testing Workspace Scenarios ===');

    // Test 1: Check if workspace folders exist
    const workspaceFolders = vscode.workspace.workspaceFolders;
    console.log('Workspace folders:', workspaceFolders ? workspaceFolders.length : 0);

    if (workspaceFolders && workspaceFolders.length > 0) {
        console.log('Workspace folder paths:', workspaceFolders.map(f => f.uri.fsPath));
    }

    // Test 2: Try to get configuration safely
    function getSlimConfiguration(key: string, defaultValue: any) {
        try {
            if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
                console.log(`No workspace available, using default value for ${key}:`, defaultValue);
                return defaultValue;
            }
            return vscode.workspace.getConfiguration('slim').get(key, defaultValue);
        } catch (error) {
            console.warn(`Error accessing workspace configuration for ${key}:`, error);
            return defaultValue;
        }
    }

    const indentSize = getSlimConfiguration('indentSize', 2);
    console.log('Indent size:', indentSize);

    // Test 3: Check workspace name
    const workspaceName = vscode.workspace.name;
    console.log('Workspace name:', workspaceName);

    console.log('=== Workspace Tests Complete ===');
}

// Export for use in extension
export { testWorkspaceScenarios };