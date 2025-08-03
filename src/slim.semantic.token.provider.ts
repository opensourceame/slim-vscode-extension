import * as vscode from 'vscode';
import { SlimNode } from './slim.node';

export class SlimSemanticTokenProvider implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SemanticTokens> {
        const tokensBuilder = new vscode.SemanticTokensBuilder();
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const ranges = new SlimNode(line).ranges();

            ranges.forEach(range => {
                // Map range types to semantic token types
                const tokenType = this.mapRangeTypeToTokenType(range.type);

                tokensBuilder.push(
                    new vscode.Range(
                        new vscode.Position(lineIndex, range.start),
                        new vscode.Position(lineIndex, range.end)
                    ),
                    tokenType
                );
            });
        }

        return tokensBuilder.build();
    }

    private mapRangeTypeToTokenType(rangeType: string): string {
        // Map range types to semantic token types
        const typeMap: { [key: string]: string } = {
            'tag': 'tag',
            'id': 'id',
            'class': 'class',
            'attribute-name': 'attribute-name',
            'attribute-value': 'attribute-value',
            'boolean-attribute': 'boolean-attribute',
            'text': 'text'
        };

        return typeMap[rangeType] || 'text'; // Default to 'text' for unknown types
    }
}
