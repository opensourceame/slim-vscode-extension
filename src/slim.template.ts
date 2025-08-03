import * as fs from 'fs';
import { SlimNode, SlimRootNode } from './slim.node';

export class SlimTemplate {
    public root: SlimRootNode;
    public indentSize: number = 2;
    protected static BOOLEAN_ATTRIBUTES = ['checked', 'selected', 'disabled', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap'];

    constructor(template: string) {
        this.parseLines(template.split('\n'));
    }

    public render(): string {
        return this.renderNode(this.root);
    }

    private renderNode(node: SlimNode): string {
        let result = "";

        // Render this node
        if (node.depth > 0) {
            result += "  ".repeat(node.depth) + node.content + "\n";
        }

        // Render all children
        for (const child of node.children) {
            result += this.renderNode(child);
        }

        return result;
    }

    public static fromFile(filePath: string): SlimTemplate {
        const content = fs.readFileSync(filePath, 'utf8');
        return new SlimTemplate(content);
    }

    private parseLines(lines: string[]) {
        const root = new SlimRootNode();
        this.root = root;

        let lastNode = root;

        for (let i = 0; i < lines.length; i++) {
            const node = new SlimNode(lines[i]);

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