// Test the formatter logic
const { SlimTemplate } = require('./out/src/slim.core');

console.log('Testing formatter logic...');

// Test content with proper indentation
const teSlimTemplateontent = `doctype html
html
  head
    title My Website
  body
    h1 Hello, World!
    p This is a simple website.
    ul
      li Item 1
      li Item 2
      li Item 3`;

console.log('Original content:');
console.log(teSlimTemplateontent);
console.log('---');

// Test the formatter
const template = new SlimTemplate(teSlimTemplateontent);
template.indentSize = 2;

// Debug the node structure
console.log('Root children count:', template.root.children.length);
template.root.children.forEach((child, index) => {
    console.log(`Child ${index}: content="${child.content}", depth=${child.depth}, indentation=${child.indentation}`);
    child.children.forEach((grandchild, gIndex) => {
        console.log(`  Grandchild ${gIndex}: content="${grandchild.content}", depth=${grandchild.depth}, indentation=${grandchild.indentation}`);
    });
});

const rendered = template.render();

console.log('Formatted content:');
console.log(rendered);
console.log('---');

console.log('✅ Formatter test completed');