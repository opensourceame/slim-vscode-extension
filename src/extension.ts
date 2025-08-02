import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';
import { SlimSyntaxHighlighter } from './slim.syntax';

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim extension activated');

    // Register document formatter only
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('slim', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const template = new SlimTemplate(document);
            // template.indentSize = indentSize;
            const rendered = template.render();

            // Create a TextEdit that replaces the entire document
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );

            return [vscode.TextEdit.replace(fullRange, rendered)];
        }
    });

    // Register tab indentation command
    const tabIndentCommand = vscode.commands.registerCommand('slim.tabIndent', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'slim') {
            return;
        }

        const selections = editor.selections;
        if (selections.length === 0) {
            return;
        }

        const edits = SlimTemplate.indentSelections(editor.document, Array.from(selections));

        editor.edit(editBuilder => {
            for (const edit of edits) {
                editBuilder.replace(edit.range, edit.newText);
            }
        });
    });

    // Register semantic tokens provider for syntax highlighting
    const legend = new vscode.SemanticTokensLegend(
        ['type', 'property', 'class'],
        ['default', 'declaration']
    );

    const semanticTokensProvider = vscode.languages.registerDocumentSemanticTokensProvider('slim', {
        provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.SemanticTokens {
            const builder = new vscode.SemanticTokensBuilder(legend);

            for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i);
                const lineText = line.text;

                // Skip empty lines and comments
                if (!lineText.trim() || lineText.trim().startsWith('//')) {
                    continue;
                }

                // Parse the line using our logic-based approach
                const tagMatch = lineText.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)/);
                if (tagMatch) {
                    const tagName = tagMatch[1];
                    const tagStart = lineText.indexOf(tagName);

                    // Add tag token
                    builder.push(
                        i, tagStart, tagName.length,
                        0, 0 // type, default
                    );

                    // Parse attributes
                    const restOfLine = lineText.substring(tagStart + tagName.length).trim();
                    const attributes = SlimSyntaxHighlighter.splitAttributes(restOfLine);

                    let currentPos = tagStart + tagName.length;

                    for (const attr of attributes) {
                        if (attr.startsWith('#')) {
                            // ID attribute
                            builder.push(
                                i, currentPos, attr.length,
                                1, 1 // property, declaration
                            );
                        } else if (attr.startsWith('.')) {
                            // Class attribute
                            builder.push(
                                i, currentPos, attr.length,
                                2, 1 // class, declaration
                            );
                        }
                        currentPos += attr.length;
                    }
                }
            }

            return builder.build();
        }
    }, legend);

    context.subscriptions.push(formatter, tabIndentCommand, semanticTokensProvider);
}

export function deactivate() {
    console.log('Slim extension deactivated');
}
