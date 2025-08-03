// test that the node tree is built correctly

import { SlimTemplate } from "../src/slim.template";
const { expect } = require("chai");

describe("Template", () => {
    it("should build a node tree from a template", () => {
        const template = SlimTemplate.fromFile("test/fixtures/basic.html.slim");
        expect(template.root.children.length).to.equal(2);
    });
});