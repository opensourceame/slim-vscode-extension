#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { SlimTemplateCore } from './slim.core';

function printUsage() {
    console.log(`
Slim Template Renderer

Usage:
  node cli.js <input-file> [output-file]
  node cli.js --help

Examples:
  node cli.js template.slim
  node cli.js template.slim output.html
  node cli.js --help
`);
}

function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h') || args.length === 0) {
        printUsage();
        process.exit(0);
    }

    const inputFile = args[0];
    const outputFile = args[1];

    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file '${inputFile}' not found.`);
        process.exit(1);
    }

    try {
        const template = SlimTemplateCore.fromFile(inputFile);
        const rendered = template.render();

        if (outputFile) {
            fs.writeFileSync(outputFile, rendered, 'utf8');
            console.log(`Rendered template written to: ${outputFile}`);
        } else {
            console.log(rendered);
        }
    } catch (error) {
        console.error(`Error processing template: ${error.message}`);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}