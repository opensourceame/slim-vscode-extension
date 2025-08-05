import * as vscode from 'vscode';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';
import { SlimExtensionBase } from './extension.base';


export class SlimExtensionSyntax extends SlimExtensionBase {
    public static activate(context: vscode.ExtensionContext) {
        const activationId = Math.random().toString(36).substr(2, 9);
        console.log(`Slim syntax highlighting is now active! [${activationId}]`);

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
                'doctype',
                'operator',
                'variable'
            ],
            []
        );

        const semanticTokenProvider = vscode.languages.registerDocumentSemanticTokensProvider(
            { language: 'slim' },
            new SlimSemanticTokenProvider(legend),
            legend
        );

        context.subscriptions.push(semanticTokenProvider);
    }
}