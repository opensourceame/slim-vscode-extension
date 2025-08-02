import * as vscode from 'vscode';

export class SlimSyntaxHighlighter {

    /**
     * Parse a Slim line and return syntax highlighting information
     * @param line The line of Slim code to parse
     * @returns Array of TextEdit objects for syntax highlighting
     */
    public static parseLine(line: string, lineNumber: number): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];

        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('//')) {
            return edits;
        }

        // Find the first word (tag name)
        const tagMatch = line.match(/^\s*([a-zA-Z][a-zA-Z0-9]*)/);
        if (!tagMatch) {
            return edits;
        }

        const tagName = tagMatch[1];
        const tagStart = line.indexOf(tagName);

        // Highlight the tag name
        edits.push(vscode.TextEdit.replace(
            new vscode.Range(
                new vscode.Position(lineNumber, tagStart),
                new vscode.Position(lineNumber, tagStart + tagName.length)
            ),
            tagName
        ));

        // Get the rest of the line after the tag
        const restOfLine = line.substring(tagStart + tagName.length).trim();

        // Split by . or # to get attributes
        const attributes = this.splitAttributes(restOfLine);

        let currentPos = tagStart + tagName.length;

        for (const attr of attributes) {
            if (attr.startsWith('#')) {
                // ID attribute
                const idName = attr.substring(1);
                edits.push(vscode.TextEdit.replace(
                    new vscode.Range(
                        new vscode.Position(lineNumber, currentPos),
                        new vscode.Position(lineNumber, currentPos + attr.length)
                    ),
                    attr
                ));
            } else if (attr.startsWith('.')) {
                // Class attribute
                const className = attr.substring(1);
                edits.push(vscode.TextEdit.replace(
                    new vscode.Range(
                        new vscode.Position(lineNumber, currentPos),
                        new vscode.Position(lineNumber, currentPos + attr.length)
                    ),
                    attr
                ));
            }
            currentPos += attr.length;
        }

        return edits;
    }

    /**
     * Split attributes by . or # while preserving the delimiter
     * @param text The text containing attributes
     * @returns Array of attribute strings including their delimiters
     */
    public static splitAttributes(text: string): string[] {
        const attributes: string[] = [];
        let current = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === '#' || char === '.') {
                if (current) {
                    attributes.push(current);
                }
                current = char;
            } else if (char.match(/[a-zA-Z0-9_-]/)) {
                current += char;
            } else {
                if (current) {
                    attributes.push(current);
                    current = '';
                }
            }
        }

        if (current) {
            attributes.push(current);
        }

        return attributes.filter(attr => attr.length > 1); // Filter out single delimiters
    }
}