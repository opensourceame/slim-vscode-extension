import { SlimNode } from "../out/src/slim.node.js";

// Test the parseTextRanges method directly
const node = new SlimNode("this #{var_a} is a #{var_b} test");
console.log("Direct parseTextRanges test:");
console.log(node.parseTextRanges("this #{var_a} is a #{var_b} test", 0, 30));

// Test the ranges() method on a line with variables
const lineNode = new SlimNode("        h1 Welcome #{current_user.name},");
console.log("\nRanges() method test:");
console.log(lineNode.ranges());