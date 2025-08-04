import * as vscode from 'vscode';
import { SlimNode } from './slim.node';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';
import { SlimExtensionSyntax } from './extension.syntax';
import { SlimExtensionFormatter } from './extension.formatter';

export class SlimExtension {
    public getSlimConfiguration(key: string, defaultValue: any) {
        return vscode.workspace.getConfiguration('slim').get(key, defaultValue);
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim Language Support extension is now active!');

    SlimExtensionSyntax.activate(context);
    SlimExtensionFormatter.activate(context);
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
