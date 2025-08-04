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
        return this.root.render();
    }

    public tree() {
        this.root.tree();
    }

    public static fromFile(filePath: string): SlimTemplate {
        const content = fs.readFileSync(filePath, 'utf8');
        return new SlimTemplate(content);
    }

    private parseLines(lines: string[]) {
        const root  = new SlimRootNode();
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

            const node = new SlimNode(line, i);

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