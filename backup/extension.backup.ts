import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';

export function activate(context: vscode.ExtensionContext) {
    try {
        // Show a notification that the extension is active
        vscode.window.showInformationMessage('Slim Language Support extension is now active!');
        console.log('Slim Language Support extension is now active!');

        // Helper function to safely get configuration - deferred until needed
        function getSlimConfiguration(key: string, defaultValue: any) {
            try {
                // Only access workspace configuration when actually needed
                return vscode.workspace.getConfiguration('slim').get(key, defaultValue);
            } catch (error) {
                console.warn(`Error accessing workspace configuration for ${key}:`, error);
                return defaultValue;
            }
        }

        // Register document formatter with higher priority for both slim and trim files
        const formatter = vscode.languages.registerDocumentFormattingEditProvider(
            { language: 'slim' },
            {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    console.log('=== FORMATTER CALLED ===');
                    console.log('Document URI:', document.uri.toString());
                    console.log('Document language:', document.languageId);
                    console.log('Document file name:', document.fileName);
                    console.log('Document line count:', document.lineCount);

                    try {
                        const indentSize = getSlimConfiguration('indentSize', 2);
                        console.log('Indent size from config:', indentSize);

                        const originalText = document.getText();
                        console.log('Original text length:', originalText.length);
                        console.log('Original text preview:', originalText.substring(0, 200));

                        const template = new SlimTemplate(document);
                        template.indentSize = indentSize;
                        const rendered = template.render();

                        console.log('Rendered text length:', rendered.length);
                        console.log('Rendered text preview:', rendered.substring(0, 200));
                        console.log('Texts are equal:', originalText === rendered);

                        // Create a text edit for the entire document
                        const fullRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(document.getText().length)
                        );

                        const edit = vscode.TextEdit.replace(fullRange, rendered);
                        console.log('Created text edit with range:', fullRange.start.line, fullRange.start.character, 'to', fullRange.end.line, fullRange.end.character);

                        console.log('=== FORMATTER SUCCESS ===');
                        return [edit];
                    } catch (error) {
                        console.error('=== FORMATTER ERROR ===');
                        console.error('Error in formatter:', error);
                        console.error('Error stack:', error.stack);
                        return [];
                    }
                }
            }
        );

        context.subscriptions.push(formatter);

        // Register formatter for trim files
        const trimFormatter = vscode.languages.registerDocumentFormattingEditProvider(
            { language: 'slim' },
            {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    console.log('=== TRIM FORMATTER CALLED ===');
                    console.log('Document URI:', document.uri.toString());
                    console.log('Document language:', document.languageId);
                    console.log('Document file name:', document.fileName);
                    console.log('Document line count:', document.lineCount);

                    try {
                        const indentSize = getSlimConfiguration('indentSize', 2);
                        console.log('Indent size from config:', indentSize);

                        const originalText = document.getText();
                        console.log('Original text length:', originalText.length);
                        console.log('Original text preview:', originalText.substring(0, 200));

                        const template = new SlimTemplate(document);
                        template.indentSize = indentSize;
                        const rendered = template.render();

                        console.log('Rendered text length:', rendered.length);
                        console.log('Rendered text preview:', rendered.substring(0, 200));
                        console.log('Texts are equal:', originalText === rendered);

                        // Create a text edit for the entire document
                        const fullRange = new vscode.Range(
                            document.positionAt(0),
                            document.positionAt(document.getText().length)
                        );

                        const edit = vscode.TextEdit.replace(fullRange, rendered);
                        console.log('Created text edit with range:', fullRange.start.line, fullRange.start.character, 'to', fullRange.end.line, fullRange.end.character);

                        console.log('=== TRIM FORMATTER SUCCESS ===');
                        return [edit];
                    } catch (error) {
                        console.error('=== TRIM FORMATTER ERROR ===');
                        console.error('Error in formatter:', error);
                        console.error('Error stack:', error.stack);
                        return [];
                    }
                }
            }
        );

        context.subscriptions.push(trimFormatter);

        // Also register for range formatting
        const rangeFormatter = vscode.languages.registerDocumentRangeFormattingEditProvider(
            { language: 'slim' },
            {
                provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range): vscode.TextEdit[] {
                    console.log('Range formatting called for:', document.fileName);
                    return [];
                }
            }
        );

        context.subscriptions.push(rangeFormatter);

        // Register range formatter for trim files
        const trimRangeFormatter = vscode.languages.registerDocumentRangeFormattingEditProvider(
            { language: 'slim' },
            {
                provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range): vscode.TextEdit[] {
                    console.log('Trim range formatting called for:', document.fileName);
                    return [];
                }
            }
        );

        context.subscriptions.push(trimRangeFormatter);

        // Register a command to test the formatter
        const testCommand = vscode.commands.registerCommand('slim.testFormatter', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && (editor.document.languageId === 'slim' || editor.document.fileName.endsWith('.trim'))) {
                console.log('Testing formatter manually...');
                vscode.commands.executeCommand('editor.action.formatDocument');
            } else {
                vscode.window.showInformationMessage('Please open a .slim or .trim file to test the formatter');
            }
        });

        context.subscriptions.push(testCommand);

        // Register a command to check what formatters are available
        const checkFormattersCommand = vscode.commands.registerCommand('slim.checkFormatters', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && (editor.document.languageId === 'slim' || editor.document.fileName.endsWith('.trim'))) {
                console.log('Checking available formatters for slim language...');
                vscode.commands.executeCommand('editor.action.formatDocument.multiple');
            } else {
                vscode.window.showInformationMessage('Please open a .slim or .trim file to check formatters');
            }
        });

        context.subscriptions.push(checkFormattersCommand);

        // Register a command to force our formatter
        const forceFormatterCommand = vscode.commands.registerCommand('slim.forceFormat', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && (editor.document.languageId === 'slim' || editor.document.fileName.endsWith('.trim'))) {
                console.log('Forcing our formatter...');

                try {
                    const indentSize = getSlimConfiguration('indentSize', 2);
                    const template = new SlimTemplate(editor.document);
                    template.indentSize = indentSize;
                    const rendered = template.render();

                    // Apply the edit directly
                    const edit = vscode.TextEdit.replace(
                        new vscode.Range(
                            editor.document.positionAt(0),
                            editor.document.positionAt(editor.document.getText().length)
                        ),
                        rendered
                    );

                    editor.edit(editBuilder => {
                        editBuilder.replace(edit.range, edit.newText);
                    });

                    vscode.window.showInformationMessage('Slim/Trim file formatted successfully!');
                } catch (error) {
                    console.error('Error in force formatter:', error);
                    vscode.window.showErrorMessage('Error formatting Slim/Trim file: ' + error.message);
                }
            } else {
                vscode.window.showInformationMessage('Please open a .slim or .trim file to format');
            }
        });

        context.subscriptions.push(forceFormatterCommand);

        // Add a command to debug workspace issues
        const debugWorkspaceCommand = vscode.commands.registerCommand('slim.debugWorkspace', () => {
            console.log('=== DEBUGGING WORKSPACE ===');
            try {
                console.log('Workspace folders:', vscode.workspace.workspaceFolders);
                console.log('Workspace name:', vscode.workspace.name);
                console.log('Workspace file:', vscode.workspace.workspaceFile);

                // Try to access workspace configuration safely
                try {
                    const slimConfig = vscode.workspace.getConfiguration('slim');
                    console.log('Slim configuration accessible:', !!slimConfig);
                } catch (error) {
                    console.error('Error accessing slim configuration:', error);
                }

                vscode.window.showInformationMessage('Workspace debug info logged to console');
            } catch (error) {
                console.error('Error in debug workspace command:', error);
                vscode.window.showErrorMessage('Error debugging workspace: ' + error.message);
            }
        });

        context.subscriptions.push(debugWorkspaceCommand);

        // Log what we registered
        console.log('Registered formatter for language: slim (supports .slim and .trim files)');
        console.log('Registered range formatter for language: slim (supports .slim and .trim files)');
        console.log('Registered test command: slim.testFormatter');
        console.log('Registered check formatters command: slim.checkFormatters');

    } catch (error) {
        console.error('=== EXTENSION ACTIVATION ERROR ===');
        console.error('Error during extension activation:', error);
        console.error('Error stack:', error.stack);

        // Show error to user
        vscode.window.showErrorMessage(`Slim extension activation failed: ${error.message}`);
    }
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}