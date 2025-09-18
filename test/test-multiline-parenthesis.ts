import * as assert from 'assert';
import * as vscode from 'vscode';
import { SlimDiagnosticProvider } from '../src/slim.diagnostic.provider';

suite('Multi-line Parenthesis Tests', () => {
    let diagnosticProvider: SlimDiagnosticProvider;

    setup(() => {
        diagnosticProvider = new SlimDiagnosticProvider();
    });

    teardown(() => {
        diagnosticProvider.dispose();
    });

    test('should detect unclosed parenthesis in multi-line Ruby code', async () => {
        const content = `= page_header(t("greeting",
  name: user.name,
  salutation: user.salutation`;

        const document = await vscode.workspace.openTextDocument({
            content: content,
            language: 'slim'
        });

        // This should trigger diagnostics
        diagnosticProvider.provideDiagnostics(document);

        // Give some time for diagnostics to be processed
        await new Promise(resolve => setTimeout(resolve, 100));

        const diagnostics = vscode.languages.getDiagnostics(document.uri);

        // Should have at least one diagnostic for unclosed parenthesis
        assert.ok(diagnostics.length > 0, 'Should have diagnostics for unclosed parenthesis');

        const parenthesisError = diagnostics.find(d =>
            d.message.includes('Unclosed parentheses') && d.source === 'slim'
        );

        assert.ok(parenthesisError, 'Should have unclosed parenthesis error');
    });

    test('should not report error for properly closed multi-line parenthesis', async () => {
        const content = `= page_header(t("greeting",
  name: user.name,
  salutation: user.salutation
  ))`;

        const document = await vscode.workspace.openTextDocument({
            content: content,
            language: 'slim'
        });

        diagnosticProvider.provideDiagnostics(document);

        await new Promise(resolve => setTimeout(resolve, 100));

        const diagnostics = vscode.languages.getDiagnostics(document.uri);

        const parenthesisError = diagnostics.find(d =>
            d.message.includes('Unclosed parentheses') && d.source === 'slim'
        );

        assert.ok(!parenthesisError, 'Should not have unclosed parenthesis error for properly closed parenthesis');
    });

    test('should handle single-line parenthesis correctly', async () => {
        const content = `= some_method(param1, param2`;

        const document = await vscode.workspace.openTextDocument({
            content: content,
            language: 'slim'
        });

        diagnosticProvider.provideDiagnostics(document);

        await new Promise(resolve => setTimeout(resolve, 100));

        const diagnostics = vscode.languages.getDiagnostics(document.uri);

        const parenthesisError = diagnostics.find(d =>
            d.message.includes('Unclosed parentheses') && d.source === 'slim'
        );

        assert.ok(parenthesisError, 'Should have unclosed parenthesis error for single-line unclosed parenthesis');
    });
});
