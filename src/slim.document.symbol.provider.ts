import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';
import { SlimNode } from './slim.node';

const MAJOR_TAGS = [
    'article',
    'div',
    'footer',
    'form',
    'header',
    'main',
    'nav',
    'ol',
    'script',
    'section',
    'style',
    'table',
    'ul'
];

export class SlimDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    async provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        console.log('SlimDocumentSymbolProvider: provideDocumentSymbols called for', document.fileName);

        const template = new SlimTemplate(document.getText());
        const root = template.root;
        const nodes: SlimNode[] = root.flatNodeList();

        console.log('Total nodes found:', nodes.length);

        // Debug: log CSS/SCSS nodes
        const cssNodes = nodes.filter(node => node.type === 'css' || node.type === 'scss');
        console.log('CSS/SCSS nodes found:', cssNodes.length);
        cssNodes.forEach(node => {
            console.log(`  ${node.type} node at line ${node.lineNumber}, children: ${node.children.length}`);
        });

        const idSymbols = this.findNodesWithIds(nodes);
        const blocksSymbols = this.findBlocks(nodes);
        const majorTagsSymbols = this.findMajorTags(nodes);
        const cssSymbols = await this.findCssSymbols(nodes, document);

        console.log('CSS symbols found:', cssSymbols.length);

        const idsParent       = this.createParentSymbol(document, idSymbols, 'Elements with IDs');
        const blocksParent    = this.createParentSymbol(document, blocksSymbols, 'Blocks');
        const majorTagsParent = this.createParentSymbol(document, majorTagsSymbols, 'Major Tags');

        const allSymbols = [idsParent, blocksParent, majorTagsParent];

        if (cssSymbols.length > 0) {
            const cssParent = this.createParentSymbol(document, cssSymbols, 'Stylesheets');
            allSymbols.push(cssParent);
            console.log('Added CSS parent with', cssSymbols.length, 'symbols');
        } else {
            console.log('No CSS symbols to add');
        }

        return allSymbols;
    }

    private findMajorTags(nodes: SlimNode[]): vscode.DocumentSymbol[] {
        const majorTags: SlimNode[] = [];

        nodes.map(node => {
            if (node.isBlockNode()) {
                return;
            }

            if (MAJOR_TAGS.includes(node.tag)) {
                majorTags.push(node);
            }
        });

        return majorTags
            .sort((a, b) => this.formatMajorTag(a).localeCompare(this.formatMajorTag(b)))
            .map(node => this.createSymbol(node));
    }

    private formatMajorTag(node: SlimNode): string {
        var name = node.tag;
        if (node.id && node.id !== '') {
            name = name + ` #${node.id}`;
        }
        // if (node.classes && node.classes.length > 0) {
        //     name = name + ` .${node.classes.join('.')}`;
        // }
        return name;
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
            if (node.id && node.id !== '') {
                name = `#${node.id} ${node.tag}`;
            } else {
                name = node.tag;
            }
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

    private async findCssSymbols(nodes: SlimNode[], document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
        const cssSymbols: vscode.DocumentSymbol[] = [];

        for (const node of nodes) {
            if (node.type === 'css' || node.type === 'scss') {
                const cssContent = this.extractCssContent(node);
                if (cssContent && cssContent.trim()) {
                    const symbols = await this.getCssSymbols(cssContent, node);
                    cssSymbols.push(...symbols);
                } else {
                    // Debug: log when CSS content is empty
                    console.log(`No CSS content found for ${node.type} block at line ${node.lineNumber}, children: ${node.children.length}`);
                }
            }
        }

        return cssSymbols;
    }

    private extractCssContent(node: SlimNode): string {
        const lines: string[] = [];

        console.log(`Extracting CSS content from ${node.type} node at line ${node.lineNumber}`);
        console.log(`Node has ${node.children.length} children`);

        // Debug: log all children
        node.children.forEach((child, i) => {
            console.log(`  Child ${i}: type="${child.type}", line="${child.line}"`);
        });

        // Collect all child nodes that are css-block or scss-block
        for (const child of node.children) {
            if (child.type === 'css-block' || child.type === 'scss-block') {
                // Get the content with proper indentation removed
                const content = child.line;
                if (content && content.trim()) {
                    // Remove the indentation to get clean CSS
                    lines.push(content.trim());
                    console.log(`  Added CSS line: "${content.trim()}"`);
                }
            }
        }

        // If no child nodes found with specific types, collect all child content
        if (lines.length === 0 && node.children.length > 0) {
            console.log('No css-block/scss-block children found, using fallback');
            // Fallback: collect all non-empty child lines that aren't block declarations
            for (const child of node.children) {
                const content = child.line;
                if (content && content.trim() && !content.trim().endsWith(':')) {
                    lines.push(content.trim());
                    console.log(`  Added fallback line: "${content.trim()}"`);
                }
            }
        }

        const result = lines.join('\n');
        console.log(`Final CSS content (${result.length} chars):`, result);
        return result;
    }

    private async getCssSymbols(cssContent: string, parentNode: SlimNode): Promise<vscode.DocumentSymbol[]> {
        try {
            // Skip if no content
            if (!cssContent || !cssContent.trim()) {
                console.log('No CSS content to process');
                return [];
            }

            console.log(`Processing CSS content for ${parentNode.type}:`, cssContent);

            // Create a virtual URI that doesn't correspond to a real file
            const languageId = parentNode.type === 'scss' ? 'scss' : 'css';
            const virtualUri = vscode.Uri.parse(`slim-temp://temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${languageId}`);

            // Register a temporary file system provider for our virtual scheme
            const disposable = vscode.workspace.registerTextDocumentContentProvider('slim-temp', {
                provideTextDocumentContent: (uri: vscode.Uri) => {
                    return cssContent;
                }
            });

            try {
                // Open the virtual document (this won't create a tab)
                const tempDoc = await vscode.workspace.openTextDocument(virtualUri);

                // Set the language mode
                await vscode.languages.setTextDocumentLanguage(tempDoc, languageId);

                console.log(`Created virtual document with language: ${languageId}`);

                // Get symbols from the CSS document using VSCode's built-in symbol provider
                const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                    'vscode.executeDocumentSymbolProvider',
                    tempDoc.uri
                );

                console.log('Raw CSS symbols from VSCode:', symbols);

                if (symbols && symbols.length > 0) {
                    console.log(`Found ${symbols.length} CSS symbols, converting...`);
                    // Convert the symbols to match our document's line numbers
                    const converted = this.convertCssSymbols(symbols, parentNode);
                    console.log(`Converted to ${converted.length} symbols`);
                    return converted;
                } else {
                    console.log('No symbols returned from CSS provider');
                }
            } finally {
                // Clean up the content provider
                disposable.dispose();
            }
        } catch (error) {
            console.error(`Failed to get CSS symbols for ${parentNode.type} block at line ${parentNode.lineNumber}:`, error);
        }

        return [];
    }

    private convertCssSymbols(symbols: vscode.DocumentSymbol[], parentNode: SlimNode): vscode.DocumentSymbol[] {
        const result: vscode.DocumentSymbol[] = [];

        for (const symbol of symbols) {
            // Adjust line numbers to match the original document
            // The CSS content starts after the CSS block declaration line (e.g., "css:")
            // We need to find the first child node's line number as the offset
            const firstChildLine = parentNode.children.length > 0 ? parentNode.children[0].lineNumber - 1 : parentNode.lineNumber;
            const startLine = firstChildLine + symbol.range.start.line;
            const endLine = firstChildLine + symbol.range.end.line;

            const adjustedRange = new vscode.Range(
                startLine,
                symbol.range.start.character,
                endLine,
                symbol.range.end.character
            );

            const adjustedSelectionRange = new vscode.Range(
                firstChildLine + symbol.selectionRange.start.line,
                symbol.selectionRange.start.character,
                firstChildLine + symbol.selectionRange.end.line,
                symbol.selectionRange.end.character
            );

            // Convert children recursively
            const adjustedChildren = symbol.children.length > 0
                ? this.convertCssChildren(symbol.children, parentNode)
                : [];

            // Create detail with line number like other symbols
            const detail = `Line ${startLine + 1}`;

            const adjustedSymbol = new vscode.DocumentSymbol(
                symbol.name,
                detail,
                symbol.kind,
                adjustedRange,
                adjustedSelectionRange
            );

            adjustedSymbol.children = adjustedChildren;
            result.push(adjustedSymbol);
        }

        return result;
    }

    private convertCssChildren(children: vscode.DocumentSymbol[], parentNode: SlimNode): vscode.DocumentSymbol[] {
        const result: vscode.DocumentSymbol[] = [];

        for (const child of children) {
            // Same adjustment as parent symbols
            const firstChildLine = parentNode.children.length > 0 ? parentNode.children[0].lineNumber - 1 : parentNode.lineNumber;
            const startLine = firstChildLine + child.range.start.line;
            const endLine = firstChildLine + child.range.end.line;

            const adjustedRange = new vscode.Range(
                startLine,
                child.range.start.character,
                endLine,
                child.range.end.character
            );

            const adjustedSelectionRange = new vscode.Range(
                firstChildLine + child.selectionRange.start.line,
                child.selectionRange.start.character,
                firstChildLine + child.selectionRange.end.line,
                child.selectionRange.end.character
            );

            const adjustedChildren = child.children.length > 0
                ? this.convertCssChildren(child.children, parentNode)
                : [];

            // Create detail with line number like other symbols
            const detail = `Line ${startLine + 1}`;

            const adjustedSymbol = new vscode.DocumentSymbol(
                child.name,
                detail,
                child.kind,
                adjustedRange,
                adjustedSelectionRange
            );

            adjustedSymbol.children = adjustedChildren;
            result.push(adjustedSymbol);
        }

        return result;
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
