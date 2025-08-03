// Mock VS Code classes for testing

// Mock VS Code classes for testing
class MockRange {
    constructor(startLine, startCharacter, endLine, endCharacter) {
        this.start = { line: startLine, character: startCharacter };
        this.end = { line: endLine, character: endCharacter };
    }
}

class MockSemanticTokensBuilder {
    constructor() {
        this.tokens = [];
    }

    push(range, tokenType) {
        this.tokens.push({ range, tokenType });
    }

    build() {
        return { tokens: this.tokens };
    }
}

// Mock the vscode module
const mockVscode = {
    Range: MockRange,
    SemanticTokensBuilder: MockSemanticTokensBuilder
};

// Import the actual provider (we'll need to modify it to work in Node.js)
class SlimSemanticTokenProvider {
    provideDocumentSemanticTokens(document, token) {
        const tokensBuilder = new MockSemanticTokensBuilder();
        const text = document.getText();
        const lines = text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            const trimmedLine = line.trim();

            if (trimmedLine === '') continue;

            // Find the start of the content (after indentation)
            const contentStart = line.search(/\S/);
            if (contentStart === -1) continue;

            // Check for doctype
            if (trimmedLine.startsWith('doctype')) {
                tokensBuilder.push(
                    new MockRange(lineIndex, contentStart, lineIndex, contentStart + 'doctype'.length),
                    'doctype'
                );
                continue;
            }

            // Check for comments
            if (trimmedLine.startsWith('/')) {
                tokensBuilder.push(
                    new MockRange(lineIndex, contentStart, lineIndex, line.length),
                    'comment'
                );
                continue;
            }

            // Check for HTML tags (but not text that starts with a letter)
            const tagMatch = trimmedLine.match(/^([a-zA-Z][a-zA-Z0-9]*)(?=\s|$|#|\.|\[)/);
            if (tagMatch) {
                const tagName = tagMatch[1];
                tokensBuilder.push(
                    new MockRange(lineIndex, contentStart, lineIndex, contentStart + tagName.length),
                    'tag'
                );

                // Look for attributes
                const attributeMatches = trimmedLine.matchAll(/([a-zA-Z][a-zA-Z0-9-]*)=["'][^"']*["']/g);
                for (const match of attributeMatches) {
                    const attrName = match[1];
                    const attrStart = contentStart + match.index;
                    tokensBuilder.push(
                        new MockRange(lineIndex, attrStart, lineIndex, attrStart + attrName.length),
                        'attribute'
                    );
                }

                // Look for IDs
                const idMatches = trimmedLine.matchAll(/#([a-zA-Z][a-zA-Z0-9-]*)/g);
                for (const match of idMatches) {
                    const idName = match[1];
                    const idStart = contentStart + match.index + 1; // +1 to skip the #
                    tokensBuilder.push(
                        new MockRange(lineIndex, idStart, lineIndex, idStart + idName.length),
                        'id'
                    );
                }

                // Look for classes
                const classMatches = trimmedLine.matchAll(/\.([a-zA-Z][a-zA-Z0-9-]*)/g);
                for (const match of classMatches) {
                    const className = match[1];
                    const classStart = contentStart + match.index + 1; // +1 to skip the .
                    tokensBuilder.push(
                        new MockRange(lineIndex, classStart, lineIndex, classStart + className.length),
                        'class'
                    );
                }

                continue;
            }

            // If it's not a tag, treat as text content
            tokensBuilder.push(
                new MockRange(lineIndex, contentStart, lineIndex, line.length),
                'text'
            );
        }

        return tokensBuilder.build();
    }
}

// Test cases
const teSlimTemplateases = [
    {
        name: "Basic HTML tag",
        input: "div",
        expected: [{ tokenType: 'tag', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } } }]
    },
    {
        name: "Tag with ID",
        input: "div#myId",
        expected: [
            { tokenType: 'tag', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } } },
            { tokenType: 'id', range: { start: { line: 0, character: 4 }, end: { line: 0, character: 9 } } }
        ]
    },
    {
        name: "Tag with class",
        input: "div.myClass",
        expected: [
            { tokenType: 'tag', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } } },
            { tokenType: 'class', range: { start: { line: 0, character: 4 }, end: { line: 0, character: 11 } } }
        ]
    },
    {
        name: "Tag with attribute",
        input: 'div id="myId"',
        expected: [
            { tokenType: 'tag', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } } },
            { tokenType: 'attribute', range: { start: { line: 0, character: 4 }, end: { line: 0, character: 6 } } }
        ]
    },
    {
        name: "Doctype",
        input: "doctype html",
        expected: [{ tokenType: 'doctype', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 7 } } }]
    },
    {
        name: "Comment",
        input: "/ This is a comment",
        expected: [{ tokenType: 'comment', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 19 } } }]
    },
    {
        name: "Text content",
        input: "Hello World",
        expected: [{ tokenType: 'text', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 11 } } }]
    },
    {
        name: "Complex tag with ID, class, and attributes",
        input: 'button#submit.btn.primary type="submit" disabled',
        expected: [
            { tokenType: 'tag', range: { start: { line: 0, character: 0 }, end: { line: 0, character: 6 } } },
            { tokenType: 'id', range: { start: { line: 0, character: 7 }, end: { line: 0, character: 13 } } },
            { tokenType: 'class', range: { start: { line: 0, character: 14 }, end: { line: 0, character: 17 } } },
            { tokenType: 'class', range: { start: { line: 0, character: 18 }, end: { line: 0, character: 25 } } },
            { tokenType: 'attribute', range: { start: { line: 0, character: 26 }, end: { line: 0, character: 30 } } }
        ]
    }
];

// Mock document
class MockDocument {
    constructor(text) {
        this.text = text;
    }

    getText() {
        return this.text;
    }
}

// Run tests
function runTests() {
    const provider = new SlimSemanticTokenProvider();
    let passed = 0;
    let failed = 0;

    console.log('Testing SlimSemanticTokenProvider...\n');

    for (const teSlimTemplatease of teSlimTemplateases) {
        console.log(`Test: ${teSlimTemplatease.name}`);
        console.log(`Input: "${teSlimTemplatease.input}"`);

        const document = new MockDocument(teSlimTemplatease.input);
        const result = provider.provideDocumentSemanticTokens(document);

        console.log(`Expected: ${JSON.stringify(teSlimTemplatease.expected, null, 2)}`);
        console.log(`Actual: ${JSON.stringify(result.tokens, null, 2)}`);

        // Normalize the results for comparison by sorting properties
        const normalizeTokens = (tokens) => {
            return tokens.map(token => ({
                tokenType: token.tokenType,
                range: token.range
            }));
        };

        const actualNormalized = normalizeTokens(result.tokens);
        const expectedNormalized = normalizeTokens(teSlimTemplatease.expected);

        const matches = JSON.stringify(actualNormalized) === JSON.stringify(expectedNormalized);

        if (matches) {
            console.log('✅ PASSED\n');
            passed++;
        } else {
            console.log('❌ FAILED\n');
            failed++;
        }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('💥 Some tests failed!');
    }
}

// Run the tests
runTests();