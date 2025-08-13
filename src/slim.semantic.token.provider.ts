import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';

export class SlimSemanticTokenProvider implements vscode.DocumentSemanticTokensProvider {
    private legend: vscode.SemanticTokensLegend;

    constructor(legend: vscode.SemanticTokensLegend) {
        this.legend = legend;
    }

    provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SemanticTokens> {
        const tokensBuilder = new vscode.SemanticTokensBuilder(this.legend);
        const template = new SlimTemplate(document.getText());
        const root = template.root;
        const lineRanges = root.getLineRanges();

        for (const lineRange of lineRanges) {
            lineRange.ranges.forEach(range => {
                // Check if this is a Ruby code section that should use embedded language
                if (this.shouldUseEmbeddedRuby(range)) {
                    // Mark tIn his range as embedded Ruby language with the embeddedLanguage modifier
                    const embeddedLanguageModifier = this.legend.tokenModifiers.indexOf('embeddedLanguage');
                    tokensBuilder.push(
                        lineRange.lineNumber - 1, // line numbers are 1-indexed, but semantic tokens are 0-indexed
                        range.start,
                        range.end - range.start,
                        this.legend.tokenTypes.indexOf('text'),
                        embeddedLanguageModifier >= 0 ? (1 << embeddedLanguageModifier) : 0
                    );
                } else {
                    tokensBuilder.push(
                        lineRange.lineNumber - 1,
                        range.start,
                        range.end - range.start,
                        this.legend.tokenTypes.indexOf(range.tokenType)
                    );
                }
            });
        }

        console.log(lineRanges);

        return tokensBuilder.build();
    }

    private shouldUseEmbeddedRuby(range: any): boolean {
        // return range.node.isBlockNode();
        // Mark Ruby code sections for embedded language support
        return range.type === 'logic' || range.type === 'ruby-block';
    }
}
