import * as fs from 'fs';

export class SlimNode {
    public tag: string;
    public depth: number;
    public indentation: number;
    public children: SlimNode[];
    public parent: SlimNode | null;
    public content: string;

    constructor(line: string) {
        this.depth = null;
        this.indentation = this.indentationScore(line);
        this.children = [];
        this.parent = null;
        this.content = line;
    }

    public addChild(child: SlimNode) {
        child.depth = this.depth + 1;
        child.parent = this;
        this.children.push(child);
    }

    // calculate the number of spaces at the start of the line
    // assume 4 spaces for any tabs
    public indentationScore(line: string): number {
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

export class SlimRootNode extends SlimNode {
    constructor() {
        super("");
        this.depth = 0;
        this.indentation = 0;
        this.tag = "root";
    }
}

export class SlimTemplateCore {
    public root: SlimRootNode;
    public indentSize: number = 2;

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
            result += node.content + "\n";
        }

        // Render all children
        for (const child of node.children) {
            result += this.renderNode(child);
        }

        return result;
    }

    public static fromFile(filePath: string): SlimTemplateCore {
        const content = fs.readFileSync(filePath, 'utf8');
        return new SlimTemplateCore(content);
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