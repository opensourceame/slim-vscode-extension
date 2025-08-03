// Simple test for the ranges() function
const { SlimNode } = require('../out/src/slim.node.js');

function testRanges() {
    console.log('Testing ranges() function...\n');

    // Test case: "button#save.btn.btn-primary data-target="form" save changes"
    const testLine = "button#save.btn.btn-primary data-target=\"form\" save changes";
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
        { type: "attribute-name", start: 26, end: 37, text: "data-target" },
        { type: "attribute-value", start: 38, end: 43, text: "\"form\"" },
        { type: "text", start: 44, end: 48, text: "save" },
        { type: "text", start: 49, end: 56, text: "changes" }
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

    console.log('Has tag "button":', hasTag ? '✅' : '❌');
    console.log('Has id "#save":', hasId ? '✅' : '❌');
    console.log('Has classes ".btn" and ".btn-primary":', hasClasses ? '✅' : '❌');
    console.log('Has attribute name "data-target":', hasAttributeName ? '✅' : '❌');
    console.log('Has attribute value "\"form\"":', hasAttributeValue ? '✅' : '❌');
}

// Run the test
testRanges();