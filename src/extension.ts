import * as vscode from 'vscode';
import { SlimNode } from './slim.node';
import { SlimSyntaxHighlighter } from './slim.syntax';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';
import { SlimExtensionSyntax } from './extension.syntax';

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim Language Support extension is now active!');

    SlimExtensionSyntax.activate(context);
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
