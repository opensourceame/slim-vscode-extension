import * as vscode from 'vscode';
import { SlimSyntaxHighlighter } from './slim.syntax';

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim Language Support extension is now active!');

    // Register semantic token provider for Slim syntax highlighting
    const legend = new vscode.SemanticTokensLegend(
        [
            'tag',
            'attribute',
            'text',
            'comment',
            'doctype',
            'id',
            'class'
        ],
        []
    );

    const semanticTokenProvider = vscode.languages.registerDocumentSemanticTokensProvider(
        { language: 'slim' },
        new SlimSemanticTokenProvider(),
        legend
    );

    context.subscriptions.push(semanticTokenProvider);
}

class SlimSemanticTokenProvider implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SemanticTokens> {
        const tokensBuilder = new vscode.SemanticTokensBuilder();
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {

        }

        return tokensBuilder.build();
    }

    private parseLine(line: string, lineNumber: number): vscode.Range[] {
        const edits = new SlimSyntaxHighlighter(line, lineNumber);
        const edits = highlighter.edits;

        return edits.map(edit => edit.range);
    }
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
