// Simple TypeScript test without mocha
import { SlimNode } from "../src/slim.core";

function assert(condition: boolean, message: string) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`✓ ${message}`);
}

console.log("Testing SlimNode with TypeScript (no compilation)...");

// Test 1: Basic indentation
const node1 = new SlimNode("  tag");
assert(node1.indentation === 2, "2 spaces should equal 2");

// Test 2: Tabs
const node2 = new SlimNode("\t\ttag");
assert(node2.indentation === 8, "2 tabs should equal 8");

// Test 3: Single space
const node3 = new SlimNode(" tag");
assert(node3.indentation === 1, "1 space should equal 1");

// Test 4: Mixed tabs and spaces
const node4 = new SlimNode("\t tag");
assert(node4.indentation === 5, "1 tab + 1 space should equal 5");

// Test 5: No indentation
const node5 = new SlimNode("tag");
assert(node5.indentation === 0, "no indentation should equal 0");

console.log("All TypeScript tests passed!");