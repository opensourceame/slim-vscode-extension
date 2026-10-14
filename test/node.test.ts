// test that the indentation score is correct

import { SlimNode } from "../src/slim.node";
const { expect } = require("chai");

describe("Node", () => {
    it("should have an indentation score of 2", () => {
        const node = new SlimNode("  tag");
        expect(node.indentation).to.equal(2);
    });

    it("should consider tabs as 4 spaces", () => {
        const node = new SlimNode("\t\ttag");
        expect(node.indentation).to.equal(8);
    });

    it("should consider a single space as 1 space", () => {
        const node = new SlimNode(" tag");
        expect(node.indentation).to.equal(1);
    });

    it("should handle mixtures of spaces and tabs", () => {
        const node = new SlimNode("\t tag");
        expect(node.indentation).to.equal(5);
    });

    it("should handle a single line with no indentation", () => {
        const node = new SlimNode("tag");
        expect(node.indentation).to.equal(0);
    });

    it("should treat embedded engine lines as blocks", () => {
        for (const line of ["markdown:", "sass:", "less:", "coffee:", "erb:", "textile:", "rdoc:", "javascript defer=true:"]) {
            const node = new SlimNode(line);
            expect(node.isBlockParentNode(), line).to.equal(true);
        }
    });

    it("should mark the content of embedded engine blocks as non-Slim", () => {
        const parent = new SlimNode("markdown:");
        const child = new SlimNode("  * item one");
        parent.addChild(child);
        expect(child.type).to.equal("markdown-block");
        expect(child.isBlockNode()).to.equal(true);
    });

    it("should not treat tags as embedded engine lines", () => {
        expect(new SlimNode("p markdown: is great").isBlockParentNode()).to.equal(false);
        expect(new SlimNode("markdown-editor").isBlockParentNode()).to.equal(false);
    });
});