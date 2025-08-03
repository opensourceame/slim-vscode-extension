
// Import boolean attributes from SlimTemplate
const BOOLEAN_ATTRIBUTES = ['checked', 'selected', 'disabled', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap'];

export class SlimNode {
    public id: string | null;
    public classes: string[];
    public tag: string;
    public depth: number;
    public indentation: number;
    public children: SlimNode[];
    public parent: SlimNode | null;
    public attributes: string[];
    public type: string;
    public content: string;

    constructor(line: string) {
        this.depth = null;
        this.indentation = this.indentationScore(line);
        this.children = [];
        this.parent = null;
        this.content = line;
        this.id = null;
        this.attributes = [];
        this.tag = "";
        this.type = "";
        this.classes = [];
    }

    public addChild(child: SlimNode) {
        child.depth = this.depth + 1;
        child.parent = this;
        this.children.push(child);
    }

    public ranges() {
        const ranges: Array<{type: string, start: number, end: number, text: string}> = [];
        const line = this.content.trim();
        let currentIndex = 0;

        // Skip leading whitespace
        while (currentIndex < line.length && /\s/.test(line[currentIndex])) {
            currentIndex++;
        }

        while (currentIndex < line.length) {
            const char = line[currentIndex];

            // Handle ID (starts with #)
            if (char === '#') {
                const start = currentIndex - 1;
                let end = start + 1;
                while (end < line.length && /[a-zA-Z0-9_-]/.test(line[end])) {
                    end++;
                }
                ranges.push({
                    type: "namespace",
                    start,
                    end,
                    text: line.substring(start, end)
                });
                currentIndex = end;
                continue;
            }

            // Handle class (starts with .)
            if (char === '.') {
                const start = currentIndex;
                let end = start + 1;
                while (end < line.length && /[a-zA-Z0-9_-]/.test(line[end])) {
                    end++;
                }
                ranges.push({
                    type: "class",
                    start,
                    end,
                    text: line.substring(start, end)
                });
                currentIndex = end;
                continue;
            }

            // Handle attributes (starts with [)
            if (char === '[') {
                const start = currentIndex;
                let end = start + 1;
                let bracketCount = 1;

                while (end < line.length && bracketCount > 0) {
                    if (line[end] === '[') bracketCount++;
                    if (line[end] === ']') bracketCount--;
                    end++;
                }

                const attributeText = line.substring(start + 1, end - 1);
                ranges.push({
                    type: "attribute",
                    start,
                    end,
                    text: line.substring(start, end)
                });
                currentIndex = end;
                continue;
            }

            // Handle attributes (attribute="value" or attribute=value) and boolean attributes
            if (/[a-zA-Z]/.test(char)) {
                const start = currentIndex;
                let end = start;
                while (end < line.length && /[a-zA-Z0-9_-]/.test(line[end])) {
                    end++;
                }

                const word = line.substring(start, end);

                // Check if this is a boolean attribute (not followed by =)
                if (end < line.length && line[end] !== '=' && BOOLEAN_ATTRIBUTES.includes(word)) {
                    ranges.push({
                        type: "boolean-attribute",
                        start,
                        end,
                        text: word
                    });
                    currentIndex = end;
                    continue;
                }

                // Check if this might be an attribute (followed by =)
                if (end < line.length && line[end] === '=') {
                    // This is an attribute name
                    ranges.push({
                        type: "attribute-name",
                        start,
                        end,
                        text: line.substring(start, end)
                    });
                    currentIndex = end;

                    // Skip the equals sign
                    currentIndex++;

                    // Parse the attribute value
                    if (currentIndex < line.length) {
                        const valueStart = currentIndex;
                        let valueEnd = valueStart;

                        // Check if value is quoted
                        if (line[valueStart] === '"' || line[valueStart] === "'") {
                            const quote = line[valueStart];
                            valueEnd = valueStart + 1;
                            while (valueEnd < line.length && line[valueEnd] !== quote) {
                                valueEnd++;
                            }
                            if (valueEnd < line.length) {
                                valueEnd++; // Include the closing quote
                            }
                        } else {
                            // Unquoted value - read until whitespace or end
                            while (valueEnd < line.length && !/\s/.test(line[valueEnd])) {
                                valueEnd++;
                            }
                        }

                        ranges.push({
                            type: "attribute-value",
                            start: valueStart,
                            end: valueEnd,
                            text: line.substring(valueStart, valueEnd)
                        });
                        currentIndex = valueEnd;
                        continue;
                    }
                } else {
                    // Check if this looks like a tag (only at the very beginning of the line)
                    // or if it's just text content
                    const isAtVeryStart = start === 0;
                    const isLikelyTag = isAtVeryStart && /^[a-zA-Z][a-zA-Z0-9]*$/.test(word);

                    if (isLikelyTag) {
                        ranges.push({
                            type: "tag",
                            start,
                            end,
                            text: line.substring(start, end)
                        });
                    } else {
                        ranges.push({
                            type: "text",
                            start,
                            end,
                            text: line.substring(start, end)
                        });
                    }
                    currentIndex = end;
                    continue;
                }
            }

            // Handle text content (everything else)
            if (!/\s/.test(char)) {
                const start = currentIndex;
                let end = start;
                while (end < line.length && !/\s/.test(line[end])) {
                    end++;
                }
                ranges.push({
                    type: "text",
                    start,
                    end,
                    text: line.substring(start, end)
                });
                currentIndex = end;
                continue;
            }

            // Skip whitespace
            currentIndex++;
        }

        return ranges;
    }

    // calculate the number of spaces at the start of the line
    // assume 4 spaces for any tabs
    public indentationScore(line: string): number {
        return line.replace(/\t/g, '    ').match(/^\s*/)?.[0]?.length || 0;
    }

    public render() {
        let result = "";

        if (this.depth == 0) {
            return "";
        }

        return ("  ".repeat(this.depth)) + this.content + "\n";
    }
}

export class SlimRootNode extends SlimNode {
    constructor() {
        super("");
        this.depth = 0;
        this.indentation = 0;
        this.tag = "root";
    }
}