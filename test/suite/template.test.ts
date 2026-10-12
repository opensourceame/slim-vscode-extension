// test that the node tree is built correctly

import * as assert from "assert";
import * as path from "path";
import { SlimTemplate } from "../../src/slim.template";

const FIXTURES = path.resolve(__dirname, "../../../test/fixtures");

describe("Template", () => {
    it("should build a node tree from a template", () => {
        const template = SlimTemplate.fromFile(path.join(FIXTURES, "basic.html.slim"));
        assert.strictEqual(template.root.children.length, 2);
    });
});
