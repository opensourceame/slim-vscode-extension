// test that the indentation score is correct

import { Node } from "../src/extension";
import { expect } from "chai";

describe("Node", () => {
    it("should have an indentation score of 2", () => {
        const node = new Node("  tag");
        expect(node.indentation).to.equal(2);
    });

    it("should consider tabs as 4 spaces", () => {
        const node = new Node("\t\ttag");
        expect(node.indentation).to.equal(8);
    });

    it("should consider a single space as 1 space", () => {
        const node = new Node(" tag");
        expect(node.indentation).to.equal(1);
    });

    it("should handle mixtures of spaces and tabs", () => {
        const node = new Node("\t tag");
        expect(node.indentation).to.equal(5);
    });

    it("should handle a single line with no indentation", () => {
        const node = new Node("tag");
        expect(node.indentation).to.equal(0);
    });
});