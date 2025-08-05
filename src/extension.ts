import * as vscode from 'vscode';
import { SlimExtensionFormatter }    from './extension.formatter';
import { SlimExtensionFolding }      from './extension.folding';
import { SlimExtensionSyntax }       from './extension.syntax';
import { SlimSemanticTokenProvider } from './slim.semantic.token.provider';

console.log('SlimExtension.ts loaded');

export function activate(context: vscode.ExtensionContext) {
    const activationId = Math.random().toString(36).substr(2, 9);
    console.log(`=== SLIM EXTENSION ACTIVATION START [${activationId}] ===`);
    console.log('Slim Language Support extension is now active!');
    console.log('Activation context:', context.extension.extensionPath);
    console.log('Extension ID:', context.extension.id);
    console.log('Extension path:', context.extension.extensionUri.fsPath);

    console.log(`=== ACTIVATING SUB-EXTENSIONS [${activationId}] ===`);
    SlimExtensionSyntax.activate(context);
    SlimExtensionFormatter.activate(context);
    SlimExtensionFolding.activate(context);
    console.log(`=== SLIM EXTENSION ACTIVATION COMPLETE [${activationId}] ===`);

    // Register debug command
    const debugCommand = vscode.commands.registerCommand('slim.debugSemanticTokens', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            vscode.window.showInformationMessage('No active editor found');
            return;
        }

        const document = activeEditor.document;
        if (document.languageId !== 'slim') {
            vscode.window.showInformationMessage('Current document is not a Slim file');
            return;
        }

        // Create a semantic token provider instance for debugging
        const legend = new vscode.SemanticTokensLegend(
            ['namespace', 'type', 'class', 'enum', 'interface', 'struct', 'typeParameter', 'parameter', 'variable', 'constant', 'enumMember', 'property', 'event', 'function', 'method', 'macro', 'keyword', 'modifier', 'comment', 'string', 'number', 'regexp', 'operator', 'decorator'],
            ['declaration', 'definition', 'readonly', 'static', 'deprecated', 'abstract', 'async', 'modification', 'documentation', 'defaultLibrary']
        );

        const provider = new SlimSemanticTokenProvider(legend);
        const debugInfo = provider.debugSemanticTokens(document);

        // Show debug info in output channel
        const outputChannel = vscode.window.createOutputChannel('Slim Debug');
        outputChannel.show();
        outputChannel.appendLine('=== Slim Extension Debug ===');
        outputChannel.appendLine(`Document: ${debugInfo.documentUri}`);
        outputChannel.appendLine(`Text Length: ${debugInfo.textLength}`);
        outputChannel.appendLine(`Syntax Ranges: ${debugInfo.syntaxRanges.length}`);

        debugInfo.syntaxRanges.forEach((syntaxRange: any, index: number) => {
            outputChannel.appendLine(`\nSyntax Range ${index} (Line ${syntaxRange.lineNumber}):`);
            syntaxRange.ranges.forEach((range: any, rangeIndex: number) => {
                outputChannel.appendLine(`  Range ${rangeIndex}: ${range.type} (${range.start}-${range.end}) "${range.text}"`);
            });
        });

        vscode.window.showInformationMessage(`Debug info logged to output channel. Found ${debugInfo.syntaxRanges.length} syntax ranges.`);
    });

    context.subscriptions.push(debugCommand);
}

export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
