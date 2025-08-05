import * as vscode from 'vscode';
import { SlimNode } from './slim.node';
import { SlimTemplate } from './slim.template';


export class SlimSemanticTokenProvider implements vscode.DocumentSemanticTokensProvider {
    private legend: vscode.SemanticTokensLegend;

    constructor(legend: vscode.SemanticTokensLegend) {
        this.legend = legend;
    }

    // Debug method that can be called interactively
    public debugSemanticTokens(document: vscode.TextDocument): any {
        const template = new SlimTemplate(document.getText());
        const root = template.root;
        const syntaxRanges = root.getSyntaxRanges();

        console.log('=== Semantic Token Debug Info ===');
        console.log('Document URI:', document.uri.toString());
        console.log('Document text length:', document.getText().length);
        console.log('Number of syntax ranges:', syntaxRanges.length);

        const debugInfo = {
            documentUri: document.uri.toString(),
            textLength: document.getText().length,
            syntaxRanges: syntaxRanges,
            legend: this.legend,
            rootNode: root
        };

        // Log detailed info about each range
        syntaxRanges.forEach((syntaxRange, index) => {
            console.log(`\nSyntax Range ${index}:`);
            console.log('  Line Number:', syntaxRange.lineNumber);
            console.log('  Number of ranges:', syntaxRange.ranges.length);

            syntaxRange.ranges.forEach((range, rangeIndex) => {
                console.log(`    Range ${rangeIndex}:`, {
                    type: range.type,
                    tokenType: range.tokenType,
                    start: range.start,
                    end: range.end,
                    text: range.text
                });
            });
        });

        return debugInfo;
    }

    provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SemanticTokens> {
        const tokensBuilder = new vscode.SemanticTokensBuilder(this.legend);
        const template = new SlimTemplate(document.getText());
        const root = template.root;
        const syntaxRanges = root.getSyntaxRanges();

        console.log("BLAH");
        console.log(syntaxRanges);

        for (const syntaxRange of syntaxRanges) {
            syntaxRange.ranges.forEach(range => {
                tokensBuilder.push(
                    syntaxRange.lineNumber,
                    range.start,
                    range.end - range.start,
                    this.legend.tokenTypes.indexOf(syntaxRange.node.tokenType())
                );
            });
        }

        // return null;
        return tokensBuilder.build();
    }

    private mapRangeTypeToTokenType(rangeType: string): string {
        // Map range types to semantic token types
        const typeMap: { [key: string]: string } = {
            'namespace': 'namespace',
            'tag': 'tag',
            'id': 'id',
            'class': 'class',
            'attribute-name': 'attribute-name',
            'attribute-value': 'attribute-value',
            'boolean-attribute': 'boolean-attribute',
            'text': 'text',
            'comment': 'comment',
            'doctype': 'doctype',
            'operator': 'operator'
        };

        const mappedType = typeMap[rangeType] || 'text';

        // Verify the token type exists in the legend
        if (this.legend.tokenTypes.includes(mappedType)) {
            return mappedType;
        }

        // Fallback to 'text' if the type isn't in the legend
        return 'text';
    }
}
