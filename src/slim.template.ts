import * as vscode from 'vscode';
import { SlimTemplateCore } from './slim.core';

export class SlimTemplate extends SlimTemplateCore {
    constructor(document: vscode.TextDocument) {
        super(document.getText());
    }

    public static fromDocument(document: vscode.TextDocument): SlimTemplate {
        return new SlimTemplate(document);
    }

    /**
     * Indent selected lines by 2 spaces each
     * @param document The text document
     * @param selections Array of text selections to indent
     * @returns Array of TextEdit objects for the indentation changes
     */
    public static indentSelections(document: vscode.TextDocument, selections: vscode.Selection[]): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];

        for (const selection of selections) {
            const startLine = selection.start.line;
            const endLine = selection.end.line;

            for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
                const line = document.lineAt(lineNum);
                const lineText = line.text;

                // Add 2 spaces at the beginning of the line
                const newText = '  ' + lineText;

                const range = new vscode.Range(
                    new vscode.Position(lineNum, 0),
                    new vscode.Position(lineNum, lineText.length)
                );

                edits.push(vscode.TextEdit.replace(range, newText));
            }
        }

        return edits;
    }
}
