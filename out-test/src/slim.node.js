"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlimRootNode = exports.SlimNode = void 0;
class SlimNode {
    constructor(line) {
        this.depth = 0;
        this.indentation = this.indentationScore(line);
        this.children = [];
        this.parent = null;
        this.content = line;
    }
    addChild(child) {
        child.depth = this.depth + 1;
        child.parent = this;
        this.children.push(child);
    }
    indentationScore(line) {
        // calculate the number of spaces at the start of the line
        // assume 4 spaces for any tabs
        return line.replace(/\t/g, '    ').match(/^\s*/)?.[0]?.length || 0;
    }
    render() {
        let result = "";
        if (this.depth == 0) {
            return "";
        }
        return ("  ".repeat(this.depth)) + this.content + "\n";
    }
}
exports.SlimNode = SlimNode;
class SlimRootNode extends SlimNode {
    constructor() {
        super("");
        this.depth = 0;
        this.indentation = 0;
        this.tag = "root";
    }
}
exports.SlimRootNode = SlimRootNode;
//# sourceMappingURL=slim.node.js.map