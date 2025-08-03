import * as vscode from 'vscode';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';

export class SlimExtensionSyntax {
    public static activate(context: vscode.ExtensionContext) {
        console.log('Slim Extension Syntax is now active!');
        // Register semantic token provider for Slim syntax highlighting
        const legend = new vscode.SemanticTokensLegend(
            [
                'id',
                'tag',
                'namespace',
                'class',
                'attribute-name',
                'attribute-value',
                'boolean-attribute',
                'text',
                'comment',
                'doctype'
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
}