import * as vscode from 'vscode';
import { SlimExtensionSyntax }    from './extension.syntax';
import { SlimExtensionFormatter } from './extension.formatter';
import { SlimExtensionFolding }   from './extension.folding';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';
import { SlimDiagnosticProvider } from './slim.diagnostic.provider';

export class SlimExtension {
    public static diagnosticProvider: SlimDiagnosticProvider;

    public getSlimConfiguration(key: string, defaultValue: any) {
        return vscode.workspace.getConfiguration('slim').get(key, defaultValue);
    }

    public static getDiagnosticProvider(): SlimDiagnosticProvider {
        return this.diagnosticProvider;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim Language Support extension is now active!');

    // Initialize diagnostic provider
    SlimExtension.diagnosticProvider = new SlimDiagnosticProvider();

    // Activate other extension features
    SlimExtensionSyntax.activate(context);
    SlimExtensionFormatter.activate(context);
    SlimExtensionFolding.activate(context);

    // Set up diagnostic provider for Slim files
    const diagnosticProvider = SlimExtension.getDiagnosticProvider();

    // Provide diagnostics on document open
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            if (document.languageId === 'slim') {
                diagnosticProvider.provideDiagnostics(document);
            }
        })
    );

    // Provide diagnostics on document change
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.document.languageId === 'slim') {
                diagnosticProvider.provideDiagnostics(event.document);
            }
        })
    );

    // Provide diagnostics on document save
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(document => {
            if (document.languageId === 'slim') {
                diagnosticProvider.provideDiagnostics(document);
            }
        })
    );

    // Provide diagnostics for already open Slim documents
    vscode.workspace.textDocuments.forEach(document => {
        if (document.languageId === 'slim') {
            diagnosticProvider.provideDiagnostics(document);
        }
    });

    // Dispose diagnostic provider when extension deactivates
    context.subscriptions.push(diagnosticProvider);
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
