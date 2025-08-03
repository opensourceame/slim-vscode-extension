import * as vscode from 'vscode';

export class SlimSyntaxHighlighter {
    private edits: vscode.TextEdit[] = [];
    private lineNumber: number = 0;
    private currentPos: number = 0;

    /**
     * Parse a Slim line and return syntax highlighting information
     * @param line The line of Slim code to parse
     * @returns Array of TextEdit objects for syntax highlighting
     */
    public static parseLine(line: string, lineNumber: number): vscode.TextEdit[] {
        const highlighter = new SlimSyntaxHighlighter(lineNumber);
        return highlighter.parse(line);
    }

    constructor(lineNumber: number) {
        this.lineNumber = lineNumber;
        this.edits = [];
        this.currentPos = 0;
    }

        /**
     * Main parsing method
     */
    private parse(line: string): vscode.TextEdit[] {
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('//')) {
            return this.edits;
        }

        // Parse line into components: [tag name][tag attributes][html attributes][text]
        const components = this.parseLineComponents(line);

        // Highlight tag name
        if (components.tagName) {
            this.addEdit(components.tagStart, components.tagName.length, components.tagName);
        }

        // Parse tag attributes (IDs and classes)
        if (components.tagAttributes) {
            this.currentPos = components.tagStart + components.tagName.length;
            this.parseTagAttributes(components.tagAttributes);
        }

        // Parse HTML attributes
        if (components.htmlAttributes) {
            this.currentPos = components.tagStart + components.tagName.length + components.tagAttributes.length;
            this.parseHtmlAttributes(components.htmlAttributes);
        }

        return this.edits;
    }

    /**
     * Parse line into components: [tag name][tag attributes][html attributes][text]
     */
    private parseLineComponents(line: string): {
        tagName: string;
        tagStart: number;
        tagAttributes: string;
        htmlAttributes: string;
        text: string;
    } {
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
        let tagAttrEnd = 0;
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

    /**
     * Parse Slim tag attributes (IDs and classes)
     */
    private parseTagAttributes(text: string): void {
        const attributes = this.splitTagAttributes(text);

        for (const attr of attributes) {
            if (attr.startsWith('#')) {
                // ID attribute
                this.addEdit(this.currentPos, attr.length, attr);
            } else if (attr.startsWith('.')) {
                // Class attribute
                this.addEdit(this.currentPos, attr.length, attr);
            }
            this.currentPos += attr.length;
        }
    }

    /**
     * Parse HTML attributes (key=value pairs)
     */
    private parseHtmlAttributes(text: string): void {
        const attributes = this.splitHtmlAttributes(text);

        for (const attr of attributes) {
            if (attr.includes('=')) {
                const equalIndex = attr.indexOf('=');
                if (equalIndex > 0) {
                    // Attribute name (before =)
                    const attrName = attr.substring(0, equalIndex);
                    this.addEdit(this.currentPos, attrName.length, attrName);

                    // Equal sign
                    this.addEdit(this.currentPos + attrName.length, 1, '=');

                    // Attribute value (after =)
                    const attrValue = attr.substring(equalIndex + 1);
                    if (attrValue.length > 0) {
                        this.addEdit(this.currentPos + attrName.length + 1, attrValue.length, attrValue);
                    }
                }
            }
            this.currentPos += attr.length;
        }
    }

    /**
     * Split tag attributes by . or # while preserving the delimiter
     * @param text The text containing tag attributes
     * @returns Array of attribute strings including their delimiters
     */
    private splitTagAttributes(text: string): string[] {
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

        return attributes.filter(attr => attr.length > 1);
    }

    /**
     * Split HTML attributes by space delimiter
     * @param text The text containing HTML attributes
     * @returns Array of HTML attribute strings
     */
    private splitHtmlAttributes(text: string): string[] {
        const attributes: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Handle quoted strings (for HTML attribute values)
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                current += char;
            } else if (inQuotes) {
                current += char;
            } else if (char === ' ' && current.trim()) {
                // Space delimiter for HTML attributes
                if (current) {
                    attributes.push(current);
                    current = '';
                }
            } else if (char.match(/[a-zA-Z0-9_-]/) || char === '=' || char === '"' || char === "'") {
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

        return attributes.filter(attr => attr.length > 1);
    }

    /**
     * Add an edit to the global edits list
     */
    private addEdit(startPos: number, length: number, text: string): void {
        this.edits.push(vscode.TextEdit.replace(
            new vscode.Range(
                new vscode.Position(this.lineNumber, startPos),
                new vscode.Position(this.lineNumber, startPos + length)
            ),
            text
        ));
    }

    /**
     * Legacy method for backward compatibility
     */
    public static splitAttributes(text: string): string[] {
        const highlighter = new SlimSyntaxHighlighter(0);
        return highlighter.splitTagAttributes(text);
    }
}