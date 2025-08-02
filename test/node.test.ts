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
});