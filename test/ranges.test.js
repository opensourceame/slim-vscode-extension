// Simple test for the ranges() function
const { SlimNode } = require('../out/src/slim.node.js');

function testRanges() {
    console.log('Testing ranges() function...\n');

    // Test case: "button#save.btn.btn-primary data-target="form" save changes"
    const testLine = "button#save.btn.btn-primary disabled data-target=\"form\" save changes";
    const node = new SlimNode(testLine);
    const parsedRanges = node.ranges();

    console.log('Input line:', testLine);
    console.log('\nParsed ranges:');
    console.log(JSON.stringify(parsedRanges, null, 2));

    // Expected ranges based on the test case with new attribute parsing
    const expectedRanges = [
        { type: "tag", start: 0, end: 6, text: "button" },
        { type: "id", start: 6, end: 11, text: "#save" },
        { type: "class", start: 11, end: 15, text: ".btn" },
        { type: "class", start: 15, end: 25, text: ".btn-primary" },
        { type: "boolean-attribute", start: 26, end: 34, text: "disabled" },
        { type: "attribute-name", start: 35, end: 46, text: "data-target" },
        { type: "attribute-value", start: 47, end: 52, text: "\"form\"" },
        { type: "text", start: 53, end: 65, text: "save changes" }
    ];

    console.log('\nExpected ranges:');
    console.log(JSON.stringify(expectedRanges, null, 2));

    // Simple validation
    console.log('\nValidation:');
    console.log('Number of ranges found:', parsedRanges.length);
    console.log('Number of expected ranges:', expectedRanges.length);

    // Check if we have the right number of ranges
    if (parsedRanges.length === expectedRanges.length) {
        console.log('✅ Range count matches');
    } else {
        console.log('❌ Range count mismatch');
    }

    // Check for tag, id, and classes
    const hasTag = parsedRanges.some(r => r.type === "tag" && r.text === "button");
    const hasId = parsedRanges.some(r => r.type === "id" && r.text === "#save");
    const hasClasses = parsedRanges.some(r => r.type === "class" && r.text === ".btn") &&
                      parsedRanges.some(r => r.type === "class" && r.text === ".btn-primary");

        // Check for attribute parsing
    const hasAttributeName = parsedRanges.some(r => r.type === "attribute-name" && r.text === "data-target");
    const hasAttributeValue = parsedRanges.some(r => r.type === "attribute-value" && r.text === "\"form\"");
    const hasBooleanAttribute = parsedRanges.some(r => r.type === "boolean-attribute" && r.text === "disabled");

    console.log('Has tag "button":', hasTag ? '✅' : '❌');
    console.log('Has id "#save":', hasId ? '✅' : '❌');
    console.log('Has classes ".btn" and ".btn-primary":', hasClasses ? '✅' : '❌');
    console.log('Has boolean attribute "disabled":', hasBooleanAttribute ? '✅' : '❌');
    console.log('Has attribute name "data-target":', hasAttributeName ? '✅' : '❌');
    console.log('Has attribute value "\"form\"":', hasAttributeValue ? '✅' : '❌');
}

function testSimpleTextRanges() {
    console.log('\n=== Testing simple text ranges ===\n');

    // Test case: "p This is a simple website."
    const testLine = "p This is a simple website.";
    const node = new SlimNode(testLine);
    const parsedRanges = node.ranges();

    console.log('Input line:', testLine);
    console.log('\nParsed ranges:');
    console.log(JSON.stringify(parsedRanges, null, 2));

    // Expected ranges: just two - tag and text
    const expectedRanges = [
        { type: "tag", start: 0, end: 1, text: "p" },
        { type: "text", start: 2, end: 27, text: "This is a simple website." }
    ];

    console.log('\nExpected ranges:');
    console.log(JSON.stringify(expectedRanges, null, 2));

    console.log('\nValidation:');
    console.log('Number of ranges found:', parsedRanges.length);
    console.log('Number of expected ranges:', expectedRanges.length);

    if (parsedRanges.length === expectedRanges.length) {
        console.log('✅ Range count matches');
    } else {
        console.log('❌ Range count mismatch');
    }

    // Check for correct ranges
    const hasTag = parsedRanges.some(r => r.type === "tag" && r.text === "p");
    const hasText = parsedRanges.some(r => r.type === "text" && r.text === "This is a simple website.");

    console.log('Has tag "p":', hasTag ? '✅' : '❌');
    console.log('Has text "This is a simple website.":', hasText ? '✅' : '❌');
}

// Run the tests
testRanges();
testSimpleTextRanges();