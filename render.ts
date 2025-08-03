import { SlimTemplate } from "./src/slim.core";

const tmpl = SlimTemplate.fromFile("test/fixtures/basic.html.slim");
console.log(tmpl.render());