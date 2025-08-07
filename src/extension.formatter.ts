import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';
import { SlimExtensionBase } from './extension.base';

export class SlimExtensionFormatter extends SlimExtensionBase {
    public static activate(context: vscode.ExtensionContext) {
        console.log('Slim formatter is now active!');

        const formatter = vscode.languages.registerDocumentFormattingEditProvider(
            { language: 'slim' },
            new SlimDocumentFormattingEditProvider()
        );

        const rangeFormatter = vscode.languages.registerDocumentRangeFormattingEditProvider(
            { language: 'slim' },
            new SlimDocumentRangeFormattingEditProvider()
        );

        context.subscriptions.push(formatter);
        context.subscriptions.push(rangeFormatter);
    }
}

class SlimDocumentFormattingEditProvider implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        return this.formatDocument(document, options, token);
    }

    private async formatDocument(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        const template = new SlimTemplate(document.getText());
        const edits: vscode.TextEdit[] = [];

        // Format the entire document
        const formattedContent = template.render();

        // Create a single edit for the entire document
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );

        edits.push(new vscode.TextEdit(fullRange, formattedContent));

        return edits;
    }
}

class SlimDocumentRangeFormattingEditProvider implements vscode.DocumentRangeFormattingEditProvider {
    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        return this.formatRange(document, range, options, token);
    }

    private async formatRange(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): Promise<vscode.TextEdit[]> {
        const template = new SlimTemplate(document.getText());
        const root = template.root;
        const lineRanges = root.getLineRanges();

        const edits: vscode.TextEdit[] = [];
        const rubyFormattingPromises: Promise<vscode.TextEdit[]>[] = [];

        // Find Ruby code sections within the range
        for (const lineRange of lineRanges) {
            if (lineRange.lineNumber - 1 >= range.start.line &&
                lineRange.lineNumber - 1 <= range.end.line) {

                lineRange.ranges.forEach(tokenRange => {
                    if (this.isRubyCode(tokenRange)) {
                        // Create a range for this Ruby token
                        const rubyRange = new vscode.Range(
                            lineRange.lineNumber - 1,
                            tokenRange.start,
                            lineRange.lineNumber - 1,
                            tokenRange.end
                        );

                        // Check if this Ruby range intersects with the formatting range
                        if (this.rangesIntersect(rubyRange, range)) {
                            // Delegate to Ruby formatter for this section
                            rubyFormattingPromises.push(this.formatRubyCode(document, rubyRange, options));
                        }
                    }
                });
            }
        }

        // Wait for all Ruby formatting to complete
        if (rubyFormattingPromises.length > 0) {
            const rubyEdits = await Promise.all(rubyFormattingPromises);
            rubyEdits.forEach(editArray => {
                edits.push(...editArray);
            });
        }

        // If no Ruby sections found, format as Slim
        if (edits.length === 0) {
            const template = new SlimTemplate(document.getText());
            const formattedContent = template.render();

            edits.push(new vscode.TextEdit(range, formattedContent));
        }

        return edits;
    }

    private isRubyCode(range: any): boolean {
        return range.tokenType === 'ruby' ||
               range.type === 'ruby' ||
               range.type === 'logic' ||
               (range.text && (range.text.startsWith('=') || range.text.startsWith('- ')));
    }

    private rangesIntersect(range1: vscode.Range, range2: vscode.Range): boolean {
        return !(range1.end.line < range2.start.line ||
                range2.end.line < range1.start.line ||
                (range1.end.line === range2.start.line && range1.end.character < range2.start.character) ||
                (range2.end.line === range1.start.line && range2.end.character < range1.start.character));
    }

    private async formatRubyCode(
        document: vscode.TextDocument,
        range: vscode.Range,
        options: vscode.FormattingOptions
    ): Promise<vscode.TextEdit[]> {

        // Extract the Ruby code from the range
        const rubyCode = document.getText(range);

        // Remove Slim-specific prefixes
        let cleanRubyCode = rubyCode;
        let prefix = '';
        if (cleanRubyCode.startsWith('= ')) {
            prefix = '= ';
            cleanRubyCode = cleanRubyCode.substring(2);
        } else if (cleanRubyCode.startsWith('- ')) {
            prefix = '- ';
            cleanRubyCode = cleanRubyCode.substring(2);
        }

        try {
            // Use VS Code's built-in Ruby formatter if available
            const rubyDocument = await vscode.workspace.openTextDocument({
                content: cleanRubyCode,
                language: 'ruby'
            });

            // Get Ruby formatting options
            const rubyOptions = vscode.workspace.getConfiguration('ruby');

            // Try to format using Ruby language server
            const rubyEdits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
                'vscode.executeFormatDocumentProvider',
                rubyDocument.uri,
                { ...options, ...rubyOptions }
            );

            if (rubyEdits && rubyEdits.length > 0) {
                // Map the Ruby formatting back to the original Slim range
                return rubyEdits.map(edit => {
                    const newRange = new vscode.Range(
                        range.start.line,
                        range.start.character + edit.range.start.character,
                        range.start.line,
                        range.start.character + edit.range.end.character
                    );
                    return new vscode.TextEdit(newRange, prefix + edit.newText);
                });
            }
        } catch (error) {
            console.log('Ruby formatting failed:', error);
        }

        return [];
    }
}
