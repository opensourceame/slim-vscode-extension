import { SlimNode } from '../src/slim.node';

console.log('Testing comprehensive bracket operator highlighting...');

const testCases = [
    {
        name: 'Simple attribute',
        input: 'meta[name="viewport"]',
        expectedOperators: 2,
        expectedAttributes: 1
    },
    {
        name: 'Multiple attributes',
        input: 'div[class="container" id="main"]',
        expectedOperators: 2,
        expectedAttributes: 1
    },
    {
        name: 'Nested brackets (should not break)',
        input: 'div[data-attr="[nested]"]',
        expectedOperators: 2,
        expectedAttributes: 1
    },
    {
        name: 'Empty brackets',
        input: 'div[]',
        expectedOperators: 2,
        expectedAttributes: 0
    },
    {
        name: 'Mixed attribute styles',
        input: 'input[type="text" disabled]',
        expectedOperators: 2,
        expectedAttributes: 1
    },
    {
        name: 'Complex attribute with spaces',
        input: 'meta[name="viewport" content="width=device-width, initial-scale=1.0"]',
        expectedOperators: 2,
        expectedAttributes: 1
    }
];

let allPassed = true;

testCases.forEach((testCase, index) => {
    console.log(`\nTest ${index + 1}: ${testCase.name}`);
    console.log(`Input: ${testCase.input}`);
    
    const node = new SlimNode(testCase.input);
    const ranges = node.ranges();
    
    const operators = ranges.filter(r => r.type === 'operator');
    const attributes = ranges.filter(r => r.type === 'attribute');
    
    console.log('Ranges:', ranges);
    console.log(`Operators found: ${operators.length} (expected: ${testCase.expectedOperators})`);
    console.log(`Attributes found: ${attributes.length} (expected: ${testCase.expectedAttributes})`);
    
    const operatorsPass = operators.length === testCase.expectedOperators;
    const attributesPass = attributes.length === testCase.expectedAttributes;
    
    if (operatorsPass && attributesPass) {
        console.log('✓ PASS');
    } else {
        console.log('✗ FAIL');
        allPassed = false;
    }
    
    // Additional validation for operators
    if (operators.length >= 2) {
        const openingBracket = operators.find(op => op.text === '[');
        const closingBracket = operators.find(op => op.text === ']');
        
        if (openingBracket && closingBracket) {
            console.log('  ✓ Opening and closing brackets correctly identified');
        } else {
            console.log('  ✗ Brackets not correctly identified');
            allPassed = false;
        }
    }
});

console.log(`\n${allPassed ? '✓ All tests passed!' : '✗ Some tests failed!'}`);
console.log('Comprehensive bracket operator highlighting test completed!'); 