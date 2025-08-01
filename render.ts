import { SlimTemplateCore } from "./src/slim.core";

const tmpl = SlimTemplateCore.fromFile("test/fixtures/basic.html.slim");
console.log(tmpl.render());