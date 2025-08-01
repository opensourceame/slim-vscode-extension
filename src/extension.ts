import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim Language Support extension is now active!');

    // Register document formatter only
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('slim', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const indentSize = vscode.workspace.getConfiguration('slim').get<number>('indentSize', 2);
            const template = new SlimTemplate(document);
            template.indentSize = indentSize;
            const rendered = template.render();

            // Create a text edit for the entire document
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            return [vscode.TextEdit.replace(fullRange, rendered)];
        }
    });

    context.subscriptions.push(formatter);
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
