import { SlimTemplate } from "./slim.template";

// Import boolean attributes from SlimTemplate
const BOOLEAN_ATTRIBUTES = ['checked', 'selected', 'disabled', 'readonly', 'multiple', 'ismap', 'defer', 'declare', 'noresize', 'nowrap'];
const TOKEN_MAP = {
    'attribute-name': 'property',
    'attribute-value': 'struct',
    'boolean-attribute': 'boolean-attribute',
    'class': 'class',
    'comment': 'comment',
    'comment-block': 'comment',
    'css': 'macro',
    'css-block': 'text',
    'doctype': 'doctype',
    'id': 'parameter',
    'javascript': 'macro',
    'javascript-block': 'text',
    'label': 'label',
    'logic': 'punctuation',
    'namespace': 'namespace',
    'scss': 'namespace',
    'scss-block': 'text',
    'operator': 'operator',
    'ruby': 'macro',
    'ruby-block': 'variable',
    'tag': 'function',
    'text': 'text',
    'variable': 'variable',
};
const PRESERVE_BLOCK_TYPES = ['comment', 'javascript', 'css', 'scss', 'ruby'];

export class SlimNode {
    public id: string | null;
    public type: string;
    public tag: string;
    public depth: number;
    public indentation: number;
    public children: SlimNode[];
    public parent: SlimNode | null;
    public attributes: string[];
    public content: string;
    public line: string;
    public blankLinesAbove: number;
    public lineNumber: number;
    public template: SlimTemplate;

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

        if (trimmed == 'javascript:') {
            this.type = "javascript";
            return;
        }

        if (trimmed == 'css:') {
            this.type = "css";
            return;
        }

        if (trimmed == 'scss:') {
            this.type = "scss";
            return;
        }

        if (trimmed == 'ruby:') {
            this.type = "ruby";
            return;
        }

        if (trimmed.startsWith("/")) {
            this.type = "comment";
            return;
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("= ")) {
            this.type = "logic";
        }

        // Find the tag name (first word that's not a special character)
        const tagMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9]*)/);
        if (tagMatch) {
            this.tag = tagMatch[1];
        } else {
            this.tag = "";
        }

        // Parse ID (starts with #) - but only in tag/selector context, not in attribute values
        // Look for # that comes after tag name or at start, but not inside quotes or after colons
        const idMatch = trimmed.match(/^[a-zA-Z0-9]*#([a-zA-Z0-9_-]+)/) ||
                       (trimmed.startsWith('#') ? trimmed.match(/^#([a-zA-Z0-9_-]+)/) : null);
        if (idMatch) {
            this.id = idMatch[1];
        }

        // Parse attributes (in square brackets or key=value pairs)
        const attrMatches = trimmed.match(/\[([^\]]+)\]/g);
        if (attrMatches) {
            this.attributes = attrMatches.map(match => match.substring(1, match.length - 1));
        }
    }

    public addChild(child: SlimNode) {
        child.depth    = this.depth + 1;
        child.parent   = this;
        child.template = this.template;

        if (PRESERVE_BLOCK_TYPES.includes(this.type)) {
            child.type = this.type + "-block";
        }

        if (this.isBlockNode()) {
            child.type = this.type;
        }

        this.children.push(child);
    }

    public ranges() {
        if (PRESERVE_BLOCK_TYPES.includes(this.type)) {
            return [new SlimNodeRange(
                this.type,
                0,
                this.content.length,
                this.content
            )];
        }

        if (this.isLogicNode()) {
            return this.parseTextRanges(this.content, 0, this.content.length);
        }

        if (this.isBlockNode()) {
            return [new SlimNodeRange(
                this.type,
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
                    ranges.push(...this.parseTextRanges(textContent, start, end));
                }
                break; // Exit the loop since we've processed the rest of the line
            }

            // Skip whitespace
            currentIndex++;
        }

        // add the indentation to the ranges
        ranges.forEach(range => {
            range.start += indent;
            range.end   += indent;
        });

        return ranges;
    }

    public parseTextRanges(text: string, start: number, end: number) {
        const ranges: SlimNodeRange[] = [];
        let currentPos = start;

        if (text.startsWith("=")) {
            return [new SlimNodeRange("ruby", start, end, text)];
        }

        // Split by #{...} and {{...}} patterns, keeping the delimiters
        const parts = text.split(/(#\{[^}]*\}|\{\{[^}]*\}\})/g);

        for (const part of parts) {
            if (!part) continue; // Skip empty parts

            const partStart = currentPos;
            const partEnd = currentPos + part.length;

            if (part.startsWith("#{") || part.startsWith("{{")) {
                ranges.push(new SlimNodeRange("variable", partStart, partEnd, part));
            } else {
                ranges.push(new SlimNodeRange("text", partStart, partEnd, part));
            }

            currentPos = partEnd;
        }

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
            result += this.whitespace() + this.line + "\n";
        }

        for (const child of this.children) {
            result += child.render();
        }

        return result;
    }

    private whitespace() {
        if (this.depth < 1) {
            return "";
        }

        if (this.isBlockNode() && this.template.preserveNonSlimIndentation) {
            return this.parent.whitespace() + " ".repeat(this.indentation - this.parent.indentation);
        }

        if (this.template.useTabs) {
            return "\t".repeat(this.depth);
        }

        return " ".repeat(this.depth * this.template.indentSize);
    }

    public flatNodeList(): SlimNode[] {
        const nodes: SlimNode[] = [];
        for (const child of this.children) {
            nodes.push(child);
            nodes.push(...child.flatNodeList());
        }

        return nodes;
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

    public getFullContent(withReturnChars: boolean = false): string {
        let result = "";
        if (withReturnChars) {
            result = "\n".repeat(this.blankLinesAbove);
            result += this.content + "\n";
        } else {
            result = this.content;
        }
        for (const child of this.children) {
            result += child.getFullContent(withReturnChars);
        }
        return result;
    }

    public getInnerContent(withReturnChars: boolean = false): string {
        let result = "";
        for (const child of this.children) {
            result += child.getFullContent(withReturnChars);
        }
        return result;
    }

    public getFoldingRanges(minLines: number = 1): Array<{ start: number, end: number, tag: string }> {
        const ranges: Array<{ start: number, end: number, tag: string }> = [];

        const blockLines = this.blockLines(0);
        if (blockLines > minLines && !this.isRootNode()) {
            ranges.push({
                start: this.lineNumber - 1,
                end: this.getEndLine() - 1,
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

    public isBlockParentNode() {
        return PRESERVE_BLOCK_TYPES.includes(this.type);
    }

    public isBlockNode() {
        return this.type.endsWith("-block");
    }

    public isLogicNode() {
        return this.type.startsWith("logic");
    }

    public getLineRanges(lineRanges: Array<SlimLineRange> = []): Array<SlimLineRange> {
        if (!this.isRootNode()) {
            lineRanges.push(new SlimLineRange(this.lineNumber, this, this.ranges() as SlimNodeRange[]));
        }

        for (const child of this.children) {
           child.getLineRanges(lineRanges);
        }

        return lineRanges;
    }

    public tokenType(): string {
        return TOKEN_MAP[this.type] || "text";
    }
}

export class SlimRootNode extends SlimNode {
    constructor(template: SlimTemplate) {
        super("");
        this.depth = -1;
        this.indentation = 0;
        this.tag = "root";
        this.template = template;
    }
}

class SlimLineRange {
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
        this.tokenType = TOKEN_MAP[type] || "text";
    }
}
