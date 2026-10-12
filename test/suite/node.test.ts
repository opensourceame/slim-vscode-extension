// test that the indentation score is correct

import * as assert from "assert";
import { SlimNode } from "../../src/slim.node";

describe("Node", () => {
    it("should have an indentation score of 2", () => {
        const node = new SlimNode("  tag");
        assert.strictEqual(node.indentation, 2);
    });

    it("should consider tabs as 4 spaces", () => {
        const node = new SlimNode("\t\ttag");
        assert.strictEqual(node.indentation, 8);
    });

    it("should consider a single space as 1 space", () => {
        const node = new SlimNode(" tag");
        assert.strictEqual(node.indentation, 1);
    });

    it("should handle mixtures of spaces and tabs", () => {
        const node = new SlimNode("\t tag");
        assert.strictEqual(node.indentation, 5);
    });

    it("should handle a single line with no indentation", () => {
        const node = new SlimNode("tag");
        assert.strictEqual(node.indentation, 0);
    });
});
