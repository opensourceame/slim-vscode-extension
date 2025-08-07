import * as vscode from 'vscode';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';
import { SlimDocumentSymbolProvider } from './slim.document.symbol.provider';
import { SlimExtensionBase } from './extension.base';

export class SlimExtensionSyntax extends SlimExtensionBase {
    public static activate(context: vscode.ExtensionContext) {
        console.log('Slim syntax highlighting is now active!');

        // Register semantic token provider for Slim syntax highlighting
        const legend = new vscode.SemanticTokensLegend(
            [
                'attribute-name',
                'attribute-value',
                'boolean-attribute',
                'class',
                'comment',
                'doctype',
                'id',
                'logic',
                'namespace',
                'operator',
                'ruby',
                'tag',
                'text',
                'variable'
            ],
            ['embeddedLanguage'] // Add modifier for embedded language support
        );

        const semanticTokenProvider = vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'slim' },
            new SlimSemanticTokenProvider(legend),
            legend
        );

        const documentSymbolProvider = vscode.languages.registerDocumentSymbolProvider(
            { language: 'slim' },
            new SlimDocumentSymbolProvider()
        );

        context.subscriptions.push(semanticTokenProvider);
        context.subscriptions.push(documentSymbolProvider);
    }
}