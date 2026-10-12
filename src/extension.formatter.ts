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
                    return SlimExtensionFormatter.formatDocument(document);
                }
            }
        );

        const formatOnSave = vscode.workspace.onWillSaveTextDocument(event => {
            if (SlimExtensionFormatter.shouldFormatOnSave(event)) {
                event.waitUntil(Promise.resolve(SlimExtensionFormatter.formatDocument(event.document)));
            }
        });

        context.subscriptions.push(formatter);
        context.subscriptions.push(formatOnSave);
    }

    public static formatDocument(document: vscode.TextDocument): vscode.TextEdit[] {
        const originalText = document.getText();
        const template = new SlimTemplate(originalText);
        const rendered = template.render();

        if (rendered === originalText) {
            return [];
        }

        // Create a text edit for the entire document
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(originalText.length)
        );

        console.log('document formatted: length', rendered.length, 'original length', originalText.length);

        return [vscode.TextEdit.replace(fullRange, rendered)];
    }

    private static shouldFormatOnSave(event: vscode.TextDocumentWillSaveEvent): boolean {
        const document = event.document;

        if (document.languageId !== 'slim') {
            return false;
        }

        // Like editor.formatOnSave, don't format when auto save fires after a delay
        if (event.reason === vscode.TextDocumentSaveReason.AfterDelay) {
            return false;
        }

        if (!vscode.workspace.getConfiguration('slim', document).get('formatOnSave', false)) {
            return false;
        }

        // When editor.formatOnSave is on, VS Code already runs the formatter on save
        return !vscode.workspace.getConfiguration('editor', document).get('formatOnSave', false);
    }
}
