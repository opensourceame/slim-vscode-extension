// Simple test for the semantic token provider
const { SlimNode } = require('../out/src/slim.node.js');

function testSemanticTokens() {
    console.log('Testing semantic token provider...\n');

    // Test case: "button#save.btn.btn-primary disabled data-target="form" save changes"
    const testLine = "button#save.btn.btn-primary disabled data-target=\"form\" save changes";
    const node = new SlimNode(testLine);
    const ranges = node.ranges();

    console.log('Input line:', testLine);
    console.log('\nParsed ranges:');
    console.log(JSON.stringify(ranges, null, 2));

    // Simulate semantic token creation
    const semanticTokens = [];
    ranges.forEach(range => {
        semanticTokens.push({
            range: {
                start: { line: 0, character: range.start },
                end: { line: 0, character: range.end }
            },
            type: range.type
        });
    });

    console.log('\nSemantic tokens:');
    console.log(JSON.stringify(semanticTokens, null, 2));

    // Validate token types
    const expectedTypes = [
        'tag', 'id', 'class', 'class', 'boolean-attribute',
        'attribute-name', 'attribute-value', 'text', 'text'
    ];

    console.log('\nValidation:');
    console.log('Number of tokens:', semanticTokens.length);
    console.log('Expected number:', expectedTypes.length);

    const typeMatch = semanticTokens.every((token, index) =>
        token.type === expectedTypes[index]
    );

    console.log('Token types match expected:', typeMatch ? '✅' : '❌');

    // Check specific token types
    const hasTag = semanticTokens.some(t => t.type === 'tag');
    const hasId = semanticTokens.some(t => t.type === 'id');
    const hasClass = semanticTokens.some(t => t.type === 'class');
    const hasBooleanAttribute = semanticTokens.some(t => t.type === 'boolean-attribute');
    const hasAttributeName = semanticTokens.some(t => t.type === 'attribute-name');
    const hasAttributeValue = semanticTokens.some(t => t.type === 'attribute-value');

    console.log('Has tag token:', hasTag ? '✅' : '❌');
    console.log('Has id token:', hasId ? '✅' : '❌');
    console.log('Has class token:', hasClass ? '✅' : '❌');
    console.log('Has boolean attribute token:', hasBooleanAttribute ? '✅' : '❌');
    console.log('Has attribute name token:', hasAttributeName ? '✅' : '❌');
    console.log('Has attribute value token:', hasAttributeValue ? '✅' : '❌');
}

// Run the test
testSemanticTokens();