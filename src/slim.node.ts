
// Import boolean attributes from SlimTemplate
const BOOLEAN_ATTRIBUTES = ['checked', 'selected', 'disabled', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap'];
const TOKEN_MAP = {
    'namespace': 'namespace',
    'tag': 'tag',
    'id': 'id',
    'class': 'class',
    'attribute-name': 'attribute-name',
    'attribute-value': 'attribute-value',
    'boolean-attribute': 'boolean-attribute',
    'text': 'text',
    'comment': 'comment',
    'doctype': 'doctype',
    'operator': 'operator'
};

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
    public line: string;
    public blankLinesAbove: number;
    public lineNumber: number;

    constructor(line: string, lineNumber: number = 0) {
        this.depth = null;
        this.indentation = this.indentationScore(line);
        this.children = [];
        this.parent = null;
        this.content = line;
        this.line = line.trim();
        this.id = null;
        this.attributes = [];
        this.tag = "";
        this.type = "";
        this.classes = [];
        this.blankLinesAbove = 0;
        this.lineNumber = lineNumber;

        // Parse the tag from the line
        this.parseTag(line);
    }

    private parseTag(line: string) {
        const trimmed = line.trim();
        if (!trimmed) {
            this.tag = "";
            return;
        }

        if (trimmed.startsWith("/")) {
            this.type = "comment";
            return;
        }

        // Find the tag name (first word that's not a special character)
        const tagMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
        if (tagMatch) {
            this.tag = tagMatch[1];
        } else {
            this.tag = "";
        }

        // Parse ID (starts with #)
        const idMatch = trimmed.match(/#([a-zA-Z0-9_-]+)/);
        if (idMatch) {
            this.id = idMatch[1];
        }

        // Parse classes (start with .)
        const classMatches = trimmed.match(/\.([a-zA-Z0-9_-]+)/g);
        if (classMatches) {
            this.classes = classMatches.map(match => match.substring(1));
        }

        // Parse attributes (in square brackets or key=value pairs)
        const attrMatches = trimmed.match(/\[([^\]]+)\]/g);
        if (attrMatches) {
            this.attributes = attrMatches.map(match => match.substring(1, match.length - 1));
        }
    }

    public addChild(child: SlimNode) {
        child.depth  = this.depth + 1;
        child.parent = this;

        if (this.type == "comment") {
            child.type = "comment";
        }

        this.children.push(child);
    }

    public ranges() {
        if (this.type == "comment") {
            return [new SlimNodeRange(
                "comment",
                0,
                this.content.length,
                this.content
            )];
        }

        const ranges: SlimNodeRange[] = [];
        const indent = this.indentation;
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
                const start = currentIndex;
                let end = start + 1;
                while (end < line.length && /[a-zA-Z0-9_-]/.test(line[end])) {
                    end++;
                }
                ranges.push(new SlimNodeRange(
                    "id",
                    start,
                    end,
                    line.substring(start, end)
                ));
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
                ranges.push(new SlimNodeRange(
                    "class",
                    start,
                    end,
                    line.substring(start, end)
                ));
                currentIndex = end;
                continue;
            }

            // Handle attributes (starts with [)
            if (char === '[') {
                const start = currentIndex;
                let end = start + 1;
                let bracketCount = 1;

                // Add the opening bracket as an operator
                ranges.push(new SlimNodeRange(
                    "operator",
                    start,
                    start + 1,
                    "["
                ));

                while (end < line.length && bracketCount > 0) {
                    if (line[end] === '[') bracketCount++;
                    if (line[end] === ']') bracketCount--;
                    end++;
                }

                // Add the closing bracket as an operator
                if (end > start + 1) {
                    ranges.push(new SlimNodeRange(
                        "operator",
                        end - 1,
                        end,
                        "]"
                        ));
                }

                // Add the content inside brackets as attribute
                if (end > start + 2) {
                    ranges.push(new SlimNodeRange(
                        "attribute",
                        start + 1,
                        end - 1,
                        line.substring(start + 1, end - 1)
                    ));
                }

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
                    ranges.push(new SlimNodeRange(
                        "boolean-attribute",
                        start,
                        end,
                        word
                    ));
                    currentIndex = end;
                    continue;
                }

                // Check if this might be an attribute (followed by =)
                if (end < line.length && line[end] === '=') {
                    // This is an attribute name
                    ranges.push(new SlimNodeRange(
                        "attribute-name",
                        start,
                        end,
                        line.substring(start, end)
                    ));
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

                        ranges.push(new SlimNodeRange(
                            "attribute-value",
                            valueStart,
                            valueEnd,
                            line.substring(valueStart, valueEnd)
                        ));
                        currentIndex = valueEnd;
                        continue;
                    }
                } else {
                    // Check if this looks like a tag (only at the very beginning of the line)
                    const isAtVeryStart = start === 0;
                    const isLikelyTag = isAtVeryStart && /^[a-zA-Z][a-zA-Z0-9]*$/.test(word);

                    if (isLikelyTag) {
                        ranges.push(new SlimNodeRange(
                            "tag",
                            start,
                            end,
                            line.substring(start, end)
                        ));
                        currentIndex = end;
                        continue;
                    }
                }
            }

            // Handle text content - everything from current position to end of line
            if (!/\s/.test(char)) {
                const start = currentIndex;
                const end = line.length;
                const textContent = line.substring(start, end).trim();

                if (textContent.length > 0) {
                    ranges.push(...this.parseText(textContent, start, end));
                }
                break; // Exit the loop since we've processed the rest of the line
            }

            // Skip whitespace
            currentIndex++;
        }

        // add the indentation to the ranges
        ranges.forEach(range => {
            range.tokenType = this.tokenType();
            range.start += indent;
            range.end += indent;
        });

        return ranges;
    }

    // calculate the number of spaces at the start of the line
    // assume 4 spaces for any tabs
    public indentationScore(line: string): number {
        return line.replace(/\t/g, '    ').match(/^\s*/)?.[0]?.length || 0;
    }

    public render() {
        let result = "" + "\n".repeat(this.blankLinesAbove);;

        if (this.tag != "root") {
            result += this.whitespace(this.depth) + this.line + "\n";
        }

        for (const child of this.children) {
            result += child.render();
        }

        return result;
    }

    // TODO: split text into ranges of text and variables
    // e.g. "Hello #{name}" -> [{type: "text", start: 0, end: 5, text: "Hello "}, {type: "variable", start: 5, end: 10, text: "name"}]
    private parseText(text: string, start: number, end: number) {
        return [new SlimNodeRange(
            "text",
            start,
            end,
            text
        )];
    }

    private whitespace(depth: number) {
        if (this.depth < 1) {
            return "";
        }

        return "  ".repeat(depth);
    }

    public tree() {
        for (const child of this.children) {
            child.tree();
        }
    }

    public blockLines(n: number) {
        let lines = this.blankLinesAbove + 1 + n;
        for (const child of this.children) {
            lines += child.blockLines(n);
        }

        return lines;
    }

    public getEndLine(): number {
        if (this.children.length === 0) {
            return this.lineNumber;
        }

        // Find the maximum end line among all children
        let maxEndLine = this.lineNumber;
        for (const child of this.children) {
            const childEndLine = child.getEndLine();
            if (childEndLine > maxEndLine) {
                maxEndLine = childEndLine;
            }
        }
        return maxEndLine;
    }

    public getFoldingRanges(minLines: number = 5): Array<{ start: number, end: number, tag: string }> {
        const ranges: Array<{ start: number, end: number, tag: string }> = [];

        // Check if this node has more than 5 lines in its block
        const blockLines = this.blockLines(0);
        if (blockLines > minLines && !this.isRootNode()) {
            ranges.push({
                start: this.lineNumber,
                end: this.getEndLine(),
                tag: this.tag
            });
        }

        // Recursively check all children
        for (const child of this.children) {
            ranges.push(...child.getFoldingRanges());
        }

        return ranges;
    }

    public isRootNode() {
        return this.tag == "root";
    }

    public getSyntaxRanges(syntaxRanges: Array<SlimNodeSyntaxRange> = []): Array<SlimNodeSyntaxRange> {
        if (!this.isRootNode()) {
            syntaxRanges.push(new SlimNodeSyntaxRange(this.lineNumber, this, this.ranges() as SlimNodeRange[]));
        }

        for (const child of this.children) {
           child.getSyntaxRanges(syntaxRanges);
        }

        return syntaxRanges;
    }

    public tokenType(): string {
        return TOKEN_MAP[this.type] || "text";
    }
}

export class SlimRootNode extends SlimNode {
    constructor() {
        super("");
        this.depth = -1;
        this.indentation = 0;
        this.tag = "root";
    }
}

class SlimNodeSyntaxRange {
    public lineNumber: number;
    public node: SlimNode;
    public ranges: SlimNodeRange[];

    constructor(lineNumber: number, node: SlimNode, ranges: SlimNodeRange[]) {
        this.lineNumber = lineNumber;
        this.node = node;
        this.ranges = ranges;
    }
}

class SlimNodeRange {
    public type: string;
    public tokenType: string;
    public start: number;
    public end: number;
    public text: string;

    constructor(type: string, start: number, end: number, text: string) {
        this.type = type;
        this.start = start;
        this.end = end;
        this.text = text;
    }
}
