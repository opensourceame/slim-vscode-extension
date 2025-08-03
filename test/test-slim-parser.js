// Test script for SlimSyntaxHighlighter line parsing
function parseLineComponents(line) {
    const result = {
        tagName: '',
        tagStart: 0,
        tagAttributes: '',
        htmlAttributes: '',
        text: ''
    };

    // Find tag name
    const tagMatch = line.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)/);
    if (!tagMatch) {
        return result;
    }

    result.tagName = tagMatch[1];
    result.tagStart = line.indexOf(result.tagName);

    // Get the rest after tag name
    let remaining = line.substring(result.tagStart + result.tagName.length).trim();

    // Find where tag attributes end and HTML attributes begin
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < remaining.length; i++) {
        const char = remaining[i];

        // Handle quoted strings
        if ((char === '"' || char === "'") && !inQuotes) {
            inQuotes = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuotes) {
            inQuotes = false;
        }

        // If we find a space and we're not in quotes, check if next char is a letter (HTML attribute)
        if (char === ' ' && !inQuotes && i + 1 < remaining.length) {
            const nextChar = remaining[i + 1];
            if (nextChar.match(/[a-zA-Z]/) && !nextChar.match(/[#\.]/)) {
                // This is the start of HTML attributes
                result.tagAttributes = remaining.substring(0, i).trim();
                result.htmlAttributes = remaining.substring(i + 1).trim();
                return result;
            }
        }

        // If we find an equals sign and we're not in quotes, this is likely an HTML attribute
        if (char === '=' && !inQuotes) {
            // Look backwards to see if this is part of an HTML attribute
            let j = i - 1;
            while (j >= 0 && remaining[j].match(/[a-zA-Z0-9_-]/)) {
                j--;
            }
            if (j >= 0 && remaining[j] === ' ') {
                // This is an HTML attribute, everything before the space is tag attributes
                result.tagAttributes = remaining.substring(0, j).trim();
                result.htmlAttributes = remaining.substring(j + 1).trim();
                return result;
            }
        }

        // If we find an equals sign and we're not in quotes, and there's no space before it,
        // this is likely an HTML attribute at the start
        if (char === '=' && !inQuotes && i > 0) {
            let j = i - 1;
            while (j >= 0 && remaining[j].match(/[a-zA-Z0-9_-]/)) {
                j--;
            }
            if (j < 0) {
                // This is an HTML attribute at the start, no tag attributes
                result.tagAttributes = '';
                result.htmlAttributes = remaining.trim();
                return result;
            }
        }
    }

    // If we get here, everything after tag name is tag attributes
    result.tagAttributes = remaining;

    return result;
}

function testLineParsing(line, expected) {
    console.log(`Testing: "${line}"`);

    const result = parseLineComponents(line);

    console.log(`  Tag: "${result.tagName}" (expected: "${expected.tagName}")`);
    console.log(`  Tag Attributes: "${result.tagAttributes}" (expected: "${expected.tagAttributes}")`);
    console.log(`  HTML Attributes: "${result.htmlAttributes}" (expected: "${expected.htmlAttributes}")`);

    // Check if results match expected
    const tagMatch = result.tagName === expected.tagName;
    const tagAttrMatch = result.tagAttributes === expected.tagAttributes;
    const htmlAttrMatch = result.htmlAttributes === expected.htmlAttributes;

    if (tagMatch && tagAttrMatch && htmlAttrMatch) {
        console.log(`  ✅ PASS`);
    } else {
        console.log(`  ❌ FAIL`);
        if (!tagMatch) console.log(`    Tag mismatch`);
        if (!tagAttrMatch) console.log(`    Tag attributes mismatch`);
        if (!htmlAttrMatch) console.log(`    HTML attributes mismatch`);
    }

    console.log('');
}

const teSlimTemplateases = [
    {
        line: 'div',
        expected: { tagName: 'div', tagAttributes: '', htmlAttributes: '' }
    },
    {
        line: 'div#main',
        expected: { tagName: 'div', tagAttributes: '#main', htmlAttributes: '' }
    },
    {
        line: 'div.user',
        expected: { tagName: 'div', tagAttributes: '.user', htmlAttributes: '' }
    },
    {
        line: 'div#main.user',
        expected: { tagName: 'div', tagAttributes: '#main.user', htmlAttributes: '' }
    },
    {
        line: 'a href="https://website.com"',
        expected: { tagName: 'a', tagAttributes: '', htmlAttributes: 'href="https://website.com"' }
    },
    {
        line: 'a#link href="https://website.com"',
        expected: { tagName: 'a', tagAttributes: '#link', htmlAttributes: 'href="https://website.com"' }
    },
    {
        line: 'a.link href="https://website.com"',
        expected: { tagName: 'a', tagAttributes: '.link', htmlAttributes: 'href="https://website.com"' }
    },
    {
        line: 'a#link.link href="https://website.com" target="_blank"',
        expected: { tagName: 'a', tagAttributes: '#link.link', htmlAttributes: 'href="https://website.com" target="_blank"' }
    },
    {
        line: 'button#submit.btn.primary type="submit" disabled',
        expected: { tagName: 'button', tagAttributes: '#submit.btn.primary', htmlAttributes: 'type="submit" disabled' }
    },
    {
        line: '  div#main.user',  // with indentation
        expected: { tagName: 'div', tagAttributes: '#main.user', htmlAttributes: '' }
    },
    {
        line: 'button.btn.btn-primary#submit-form data-target="#update" disabled style="color: red" click here',
        expected: {
            tagName: 'button',
            tagAttributes: '.btn.btn-primary#submit-form',
            htmlAttributes: 'data-target="#update" disabled style="color: red" click here'
        }
    }
];

console.log('Testing SlimSyntaxHighlighter line parsing...\n');

teSlimTemplateases.forEach((teSlimTemplatease, index) => {
    console.log(`Test ${index + 1}:`);
    testLineParsing(teSlimTemplatease.line, teSlimTemplatease.expected);
});

console.log('✅ Line parsing tests completed!');