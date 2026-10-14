import * as fs from 'fs';
import { SlimNode, SlimRootNode } from './slim.node';
import { SlimExtensionBase } from './extension.base';
import * as vscode from 'vscode';

export class SlimTemplate extends SlimExtensionBase {
    public root: SlimRootNode;
    public indentSize: number;
    public preserveNonSlimIndentation: boolean;
    public useTabs: boolean;

    protected static BOOLEAN_ATTRIBUTES = ['checked', 'selected', 'disabled', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap'];

    constructor(template: string) {
        super();

        this.parseLines(template.split('\n'));

        this.indentSize                 = this.getConfig('indentSize') as number;
        this.preserveNonSlimIndentation = this.getConfig('preserveNonSlimIndentation') as boolean;
        this.useTabs                    = this.getConfig('useTab') as boolean;
    }

    public getConfig(key: string) {
        return vscode.workspace.getConfiguration('slim').get(key);
    }

    public render(): string {
        return this.root.render();
    }

    // Format the nodes on lines startLine to endLine (1-based, inclusive) and everything nested
    // in them, and return the formatted text of each of those lines by line number.
    //
    // Lines are indented relative to the unformatted line they're nested in rather than by
    // absolute depth, so that formatting part of a template can't change its structure when the
    // surrounding lines use a different indentation than the formatter would.
    public formatLines(startLine: number, endLine: number): Map<number, string> {
        const unit = this.useTabs ? "\t" : " ".repeat(this.indentSize);
        const lines = new Map<number, string>();

        const isSelected = (node: SlimNode) => node.lineNumber >= startLine && node.lineNumber <= endLine;
        const leadingWhitespace = (node: SlimNode) => node.content.match(/^\s*/)[0];
        const preservesIndentation = (node: SlimNode) => node.isBlockNode() && this.preserveNonSlimIndentation;

        // Indentation for a selected node whose parent isn't formatted
        const outerIndent = (node: SlimNode): string => {
            const parent = node.parent;

            if (preservesIndentation(node)) {
                return leadingWhitespace(node);
            }

            const target = parent.isRootNode() ? "" : leadingWhitespace(parent) + unit;

            // Only move the node if its unselected siblings are already there, otherwise it
            // could end up nested in one of them, or they in it
            const targetScore = node.indentationScore(target);
            const fitsSiblings = parent.children.every(sibling => isSelected(sibling) || sibling.indentation === targetScore);

            return fitsSiblings ? target : leadingWhitespace(node);
        };

        // Indentation for a node whose parent is formatted, mirroring SlimNode.render()
        const innerIndent = (node: SlimNode, parentIndent: string): string => {
            if (preservesIndentation(node)) {
                return parentIndent + " ".repeat(node.indentation - node.parent.indentation);
            }

            return parentIndent + unit;
        };

        const format = (node: SlimNode, indent: string) => {
            lines.set(node.lineNumber, indent + node.line);

            for (const child of node.children) {
                format(child, innerIndent(child, indent));
            }
        };

        const visit = (node: SlimNode) => {
            for (const child of node.children) {
                if (isSelected(child)) {
                    format(child, outerIndent(child));
                } else {
                    visit(child);
                }
            }
        };

        visit(this.root);

        return lines;
    }

    public tree() {
        this.root.tree();
    }

    public static fromFile(filePath: string): SlimTemplate {
        const content = fs.readFileSync(filePath, 'utf8');
        return new SlimTemplate(content);
    }

    private parseLines(lines: string[]) {
        const root  = new SlimRootNode(this);
        const nodes = [];
        this.root = root;

        let lastNode = root;
        let blankLines = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.trim() == "") {
                blankLines += 1;
                continue;
            }

            const node = new SlimNode(line, i + 1);

            if (blankLines > 0) {
                node.blankLinesAbove = blankLines;
                blankLines = 0;
            }

            nodes.push(node);

            if (node.indentation > lastNode.indentation) {
                lastNode.addChild(node);
                lastNode = node;
            } else if (node.indentation == lastNode.indentation) {
                if (lastNode.parent) {
                    lastNode.parent.addChild(node);
                } else {
                    root.addChild(node);
                }
                lastNode = node;
            } else if (node.indentation < lastNode.indentation) {
                while (lastNode.parent && lastNode.parent.indentation >= node.indentation) {
                    lastNode = lastNode.parent;
                }

                if (lastNode.parent) {
                    lastNode.parent.addChild(node);
                } else {
                    root.addChild(node);
                }
                lastNode = node;
            }
        }
    }
}