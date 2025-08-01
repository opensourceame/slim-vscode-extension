// Simple test script
const { SlimNode } = require("./out-test/src/slim.node.js");

console.log("Testing SlimNode class...");

// Test 1: Basic indentation
const node1 = new SlimNode("  tag");
console.log("Test 1 - 2 spaces:", node1.indentation === 2 ? "PASS" : "FAIL");

// Test 2: Tabs
const node2 = new SlimNode("\t\ttag");
console.log("Test 2 - tabs:", node2.indentation === 8 ? "PASS" : "FAIL");

// Test 3: Single space
const node3 = new SlimNode(" tag");
console.log("Test 3 - single space:", node3.indentation === 1 ? "PASS" : "FAIL");

// Test 4: Mixed tabs and spaces
const node4 = new SlimNode("\t tag");
console.log("Test 4 - mixed:", node4.indentation === 5 ? "PASS" : "FAIL");

// Test 5: No indentation
const node5 = new SlimNode("tag");
console.log("Test 5 - no indentation:", node5.indentation === 0 ? "PASS" : "FAIL");

console.log("All tests completed!");