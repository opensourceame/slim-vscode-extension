import { SlimNode } from '../src/slim.node';

console.log('Testing bracket operator highlighting...');

// Test case 1: Simple attribute with brackets
const test1 = new SlimNode('meta[name="viewport" content="width=device-width, initial-scale=1.0"]');
const ranges1 = test1.ranges();

console.log('Test 1 - meta[name="viewport" content="width=device-width, initial-scale=1.0"]');
console.log('Ranges:', ranges1);

// Check if opening and closing brackets are identified as operators
const operators1 = ranges1.filter(r => r.type === 'operator');
const attributes1 = ranges1.filter(r => r.type === 'attribute');

console.log('Operators found:', operators1.length);
console.log('Attributes found:', attributes1.length);

if (operators1.length >= 2) {
    console.log('✓ Opening and closing brackets correctly identified as operators');
} else {
    console.log('✗ Brackets not correctly identified as operators');
}

if (attributes1.length >= 1) {
    console.log('✓ Attribute content correctly identified');
} else {
    console.log('✗ Attribute content not correctly identified');
}

// Test case 2: Multiple attributes
const test2 = new SlimNode('div[class="container" id="main"]');
const ranges2 = test2.ranges();

console.log('\nTest 2 - div[class="container" id="main"]');
console.log('Ranges:', ranges2);

const operators2 = ranges2.filter(r => r.type === 'operator');
const attributes2 = ranges2.filter(r => r.type === 'attribute');

console.log('Operators found:', operators2.length);
console.log('Attributes found:', attributes2.length);

if (operators2.length >= 2) {
    console.log('✓ Multiple attributes: brackets correctly identified as operators');
} else {
    console.log('✗ Multiple attributes: brackets not correctly identified as operators');
}

console.log('\nBracket operator highlighting test completed!');