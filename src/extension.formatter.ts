import * as vscode from 'vscode';
import { SlimExtensionBase } from './extension.base';
import { SlimTemplate } from './slim.template';

export class SlimExtensionFormatter extends SlimExtensionBase {
    public static activate(context: vscode.ExtensionContext) {
        console.log('Slim formatter is now active!');

        const formatter = vscode.languages.registerDocumentFormattingEditProvider(
            { language: 'slim' },
            {
                provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
                    // const indentSize = getSlimConfiguration('indentSize', 2);
                    const originalText = document.getText();
                    const template = new SlimTemplate(originalText);
                    template.indentSize = 2;
                    const rendered = template.render();

                    // Create a text edit for the entire document
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );

                    const edit = vscode.TextEdit.replace(fullRange, rendered);
                    console.log('=== FORMATTER SUCCESS ===');
                    return [edit];
                }
            }
        );

        context.subscriptions.push(formatter);

    }
}
