import * as vscode from 'vscode';
import { SlimExtensionBase } from './extension.base';
import { SlimFoldingRangeProvider } from './slim.folding.provider';

export class SlimExtensionFolding extends SlimExtensionBase {
    public static activate(context: vscode.ExtensionContext) {
        console.log('Slim folding is now active!');

        const foldingRangeProvider = vscode.languages.registerFoldingRangeProvider(
            { language: 'slim' },
            new SlimFoldingRangeProvider()
        );

        context.subscriptions.push(foldingRangeProvider);
    }
}