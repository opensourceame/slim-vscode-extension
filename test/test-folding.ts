import { SlimTemplate } from '../src/slim.template';

// Test the folding implementation
const slimContent = `doctype html
html
  head
    title My Website
    meta[name="viewport" content="width=device-width, initial-scale=1.0"]
  body
    section#header
      h1.a.b.c#abc Hello, World!
      p#article.read.highlight data-id="123" This is a simple website.
        ul#list-of-items
          li.one style="color: red;" One
          li.two Two
          li.three Three
        div#footer
          p#copyright Copyright 2025`;

const template = new SlimTemplate(slimContent);
const ranges = template.root.getFoldingRanges();

console.log('Folding ranges:', ranges);

// Based on the console output you provided, we expect these ranges:
// - html (14 lines)
// - body (10 lines) 
// - section (9 lines)
// - p (7 lines)
// - ul (4 lines) - but this should be excluded since it's <= 5 lines

console.log('\nExpected ranges:');
console.log('- html (14 lines)');
console.log('- body (10 lines)');
console.log('- section (9 lines)');
console.log('- p (7 lines)');

console.log('\nActual ranges:');
ranges.forEach(range => {
    console.log(`- ${range.tag} (lines ${range.start}-${range.end})`);
});

// Verify we have the expected number of ranges
console.log(`\nTotal ranges: ${ranges.length} (expected 4)`);

// Verify the ranges are for the correct tags
const tags = ranges.map(r => r.tag);
console.log('\nTags with folding ranges:', tags);

// Check for unexpected ranges
const unexpectedTags = ['ul', 'doctype', 'title', 'meta', 'h1', 'li', 'div'];
const foundUnexpected = unexpectedTags.filter(tag => tags.includes(tag));
if (foundUnexpected.length > 0) {
    console.log('\n❌ Unexpected folding ranges found:', foundUnexpected);
} else {
    console.log('\n✅ No unexpected folding ranges found');
}

// Check for expected ranges
const expectedTags = ['html', 'body', 'section', 'p'];
const missingExpected = expectedTags.filter(tag => !tags.includes(tag));
if (missingExpected.length > 0) {
    console.log('\n❌ Missing expected folding ranges:', missingExpected);
} else {
    console.log('\n✅ All expected folding ranges found');
} 