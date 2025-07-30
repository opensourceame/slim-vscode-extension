import { config } from 'chai';
import { ChildProcess } from 'child_process';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Slim Language Support extension is now active!');

    // Register document formatter only
    const formatter = vscode.languages.registerDocumentFormattingEditProvider('slim', {
        provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
            const indentSize = vscode.workspace.getConfiguration('slim').get<number>('indentSize', 2);
            const template = new Template();
            template.indentSize = indentSize;
            template.parseFile(document.uri);
            return template.render();
        }
    });

    context.subscriptions.push(formatter);
}

class Node {
    public depth: number;
    public indentation: number;
    public children: Node[];
    public parent: Node | null;
    public content: string;

    constructor(line: string) {
        this.depth = 0;
        this.indentation = Node.indentationScore(line);
        this.children = [];
        this.parent = null;
        this.content = line;
    }

    public addChild(child: Node) {
        child.depth  = this.depth + 1;
        child.parent = this;

        this.children.push(child);
    }

    public static indentationScore(line: string): number {
        // calculate the number of spaces at the start of the line
        // assume 4 spaces for any tabs
        return line.replace(/\t/g, '    ').match(/^\s*/)?.[0]?.length || 0;
    }

    public render() {
        let result = "";

        if (this.depth == 0) {
            return "";
        }

        return ("  ".repeat(this.depth)) + this.content + "\n";
    }
}

class RootNode extends Node {
    constructor() {
        super("");
        this.depth = 0;
        this.indentation = 0;
        this.tag = "root";
    }
}

class Template {
    public root: RootNode;
    public indentSize: number = 2;

    public render() {
        return this.root.render();
    }

    public parseFile(file: vscode.Uri): string {
        const document = vscode.workspace.openTextDocument(file);
        this.parseLines(document.getText().split('\n'));
    }

    public parseLines(lines: string[]) {
        const root = new RootNode();
        this.root = root;

        let lastNode = root;

        for (let i = 0; i < lines.length; i++) {
            const node = new Node(lines[i]);

            if (node.indentation > lastNode.indentation) {
                lastNode.addChild(node);
            }

            if (node.indentation == lastNode.indentation) {
                lastNode.parent.addChild(node);
            }

            if (node.indentation < lastNode.indentation) {
                while (lastNode.parent && lastNode.parent.indentation >= node.indentation) {
                    lastNode = lastNode.parent;
                }

                if (lastNode.parent) {
                    lastNode.parent.addChild(node);
                }
            }
        }
    }
}


export function deactivate() {
    console.log('Slim Language Support extension is now deactivated!');
}
