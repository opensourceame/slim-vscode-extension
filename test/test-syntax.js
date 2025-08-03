import { SlimSyntaxHighlighter } from "../out/src/slim.syntax.js";

const highlighter = new SlimSyntaxHighlighter(0);
const line = "button.btn.btn-primary#submit-form data-target=\"#update\" disabled style=\"color: red\" click here";
const edits = highlighter.parseLine(line, 0);

console.log(highlighter.parseLineComponents(line));
console.log(edits);