import * as vscode from 'vscode';
import { SlimNode } from './slim.node';
import { SlimTemplate } from './slim.template';

export class SlimFoldingRangeProvider implements vscode.FoldingRangeProvider {
    provideFoldingRanges(
        document: vscode.TextDocument,
        context: vscode.FoldingContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FoldingRange[]> {
        const foldingRanges: vscode.FoldingRange[] = [];
        const template = new SlimTemplate(document.getText());
        const root = template.root;

        // Get folding ranges from the root node
        const ranges = root.getFoldingRanges(vscode.workspace.getConfiguration('slim').get('codeFoldingDepth'));

        // Convert to VSCode FoldingRange objects
        for (const range of ranges) {
            foldingRanges.push(new vscode.FoldingRange(range.start, range.end));
        }

        return foldingRanges;
    }
}