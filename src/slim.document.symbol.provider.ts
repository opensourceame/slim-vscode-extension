import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';
import { SlimNode } from './slim.node';

export class SlimDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        const template = new SlimTemplate(document.getText());
        const root = template.root;
        const nodes: SlimNode[] = root.flatNodeList();

        const idSymbols = this.findNodesWithIds(nodes);
        const blocksSymbols = this.findBlocks(nodes);

        const idsParent = this.createParentSymbol(document, idSymbols, 'Elements with IDs');
        const blocksParent = this.createParentSymbol(document, blocksSymbols, 'Blocks');

        return [idsParent, blocksParent];
    }

    private findBlocks(nodes: SlimNode[]): vscode.DocumentSymbol[] {
        const blockNodes: SlimNode[] = [];

        nodes.map(node => {
            if (node.isBlockParentNode()) {
                blockNodes.push(node);
            }
        });

        return blockNodes.map(node => this.createSymbol(node)).sort((a, b) => {
            return a.name.localeCompare(b.name);
        });
    }

    private findNodesWithIds(nodes: SlimNode[]): vscode.DocumentSymbol[] {
        const idNodes: SlimNode[] = [];

        nodes.map(node => {
            if (node.isBlockNode()) {
                return;
            }

            if (node.id && node.id !== '') {
                idNodes.push(node);
            }
        });

        // Check if alphabetical sorting is enabled
        const sortAlphabetically = vscode.workspace.getConfiguration('slim').get('outlineSortAlphabetically', true);

        if (sortAlphabetically) {
            // Sort by ID#tagName (ID first, then tag name)
            idNodes.sort((a, b) => {
                const aKey = `${a.id}#${a.tag}`;
                const bKey = `${b.id}#${b.tag}`;
                return aKey.localeCompare(bKey);
            });
        }

        // Create DocumentSymbol objects
        return idNodes.map(node => this.createSymbol(node));
    }

    private createParentSymbol(document: vscode.TextDocument, childSymbols: vscode.DocumentSymbol[], name: string): vscode.DocumentSymbol {
        // Create a range that spans the entire document
        const range = new vscode.Range(
            0, 0,
            document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length
        );

        const selectionRange = new vscode.Range(0, 0, 0, 0);

        const parentSymbol = new vscode.DocumentSymbol(
            name,
            `${childSymbols.length} elements`,
            vscode.SymbolKind.Class,
            range,
            selectionRange
        );

        // Set the child symbols
        parentSymbol.children = childSymbols;

        return parentSymbol;
    }

    private createSymbol(node: any): vscode.DocumentSymbol {
        const range = new vscode.Range(
            node.lineNumber - 1, 0,
            node.lineNumber - 1, node.content.length
        );

        const selectionRange = new vscode.Range(
            node.lineNumber - 1, 0,
            node.lineNumber - 1, node.content.length
        );

        let name: string;

        if (node.isBlockParentNode()) {
            name = node.type;
        } else {
            name = `#${node.id} ${node.tag}`;
        }

        const detail = `Line ${node.lineNumber}`;
        const kind = this.getSymbolKind(node);

        return new vscode.DocumentSymbol(
            name,
            detail,
            kind,
            range,
            selectionRange
        );
    }

    private getSymbolKind(node: any): vscode.SymbolKind {
        // Use different icons for different element types
        switch (node.tag) {
            case 'button':
            case 'input':
            case 'select':
            case 'textarea':
                return vscode.SymbolKind.Field; // Form elements
            case 'a':
                return vscode.SymbolKind.Function; // Links
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
                return vscode.SymbolKind.Class; // Headings
            case 'p':
            case 'span':
            case 'div':
                return vscode.SymbolKind.String; // Text elements
            case 'form':
                return vscode.SymbolKind.Module; // Forms
            case 'nav':
            case 'header':
            case 'footer':
            case 'main':
            case 'section':
            case 'article':
            case 'aside':
                return vscode.SymbolKind.Namespace; // Structural elements
            case 'javascript':
            case 'css':
            case 'scss':
                return vscode.SymbolKind.File; // Code files
            case 'comment':
                return vscode.SymbolKind.Event; // Comments
            default:
                return vscode.SymbolKind.Variable; // Default
        }
    }
}
