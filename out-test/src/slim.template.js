class SlimTemplateVSC {
    constructor() {
        this.indentSize = 2;
    }
    render() {
        return this.root.render();
    }
    parseFile(file) {
        const document = vscode.workspace.openTextDocument(file);
        this.parseLines(document.getText().split('\n'));
    }
    parseLines(lines) {
        const root = new SlimRootNode();
        this.root = root;
        let lastNode = root;
        for (let i = 0; i < lines.length; i++) {
            const node = new SlimNode(lines[i]);
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
//# sourceMappingURL=slim.template.js.map