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

        // Track embedded language blocks to skip them
        const embeddedBlocks = this.detectEmbeddedLanguageBlocks(document);

        for (const lineRange of lineRanges) {
            // Skip if this line is inside an embedded language block
            if (this.isLineInEmbeddedBlock(lineRange.lineNumber, embeddedBlocks)) {
                continue;
            }

            lineRange.ranges.forEach(range => {
                tokensBuilder.push(
                    lineRange.lineNumber - 1, // line numbers are 1-indexed, but semantic tokens are 0-indexed
                    range.start,
                    range.end - range.start,
                    this.legend.tokenTypes.indexOf(range.tokenType)
                );
            });
        }

        console.log(lineRanges);

        return tokensBuilder.build();
    }

    /**
     * Detects embedded language blocks in the document
     * Returns an array of { startLine, endLine, language } objects
     */
    private detectEmbeddedLanguageBlocks(document: vscode.TextDocument): Array<{ startLine: number, endLine: number, language: string }> {
        const blocks: Array<{ startLine: number, endLine: number, language: string }> = [];
        const lines = document.getText().split('\n');

        let currentBlock: { startLine: number, language: string } | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check for embedded language start
            if (line === 'javascript:' || line === 'css:' || line === 'scss:' || line === 'ruby:') {
                const language = line.replace(':', '');
                currentBlock = { startLine: i + 1, language };
            }
            // Check for embedded language end
            else if (line === 'end' && currentBlock) {
                blocks.push({
                    startLine: currentBlock.startLine,
                    endLine: i + 1,
                    language: currentBlock.language
                });
                currentBlock = null;
            }
        }

        return blocks;
    }

    /**
     * Checks if a line number is inside an embedded language block
     */
    private isLineInEmbeddedBlock(lineNumber: number, embeddedBlocks: Array<{ startLine: number, endLine: number, language: string }>): boolean {
        return embeddedBlocks.some(block =>
            lineNumber >= block.startLine && lineNumber <= block.endLine
        );
    }
}
