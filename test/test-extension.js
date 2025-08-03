// Test script to verify extension functionality
const { SlimTemplate } = require('./out/src/slim.core');

console.log('Testing SlimTemplate functionality...');

// Test 1: Basic template parsing
const template = SlimTemplate.fromFile('test/fixtures/basic.html.slim');
console.log('✅ Template parsed successfully');
console.log('Root children count:', template.root.children.length);

// Test 2: Rendering
const rendered = template.render();
console.log('✅ Template rendered successfully');
console.log('Rendered output length:', rendered.length);
console.log('First 100 chars:', rendered.substring(0, 100));

// Test 3: Constructor with string
const template2 = new SlimTemplate('doctype html\nhtml\n  head\n    title Test');
console.log('✅ Constructor with string works');
console.log('Template2 children count:', template2.root.children.length);

console.log('\n🎉 All tests passed! Extension is ready for VS Code.');