import * as vscode from 'vscode';
import { SlimExtensionBase } from './extension.base';
import { SlimFoldingRangeProvider } from './slim.folding.provider';

export class SlimExtensionFolding extends SlimExtensionBase {
    public static activate(context: vscode.ExtensionContext) {
        const activationId = Math.random().toString(36).substr(2, 9);
        console.log(`Slim folding is now active! [${activationId}]`);

        const foldingRangeProvider = vscode.languages.registerFoldingRangeProvider(
            { language: 'slim' },
            new SlimFoldingRangeProvider()
        );

        context.subscriptions.push(foldingRangeProvider);
    }
}