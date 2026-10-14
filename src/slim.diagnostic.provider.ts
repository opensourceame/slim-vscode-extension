import * as vscode from 'vscode';
import { SlimTemplate } from './slim.template';
import { SlimNode } from './slim.node';
import { scanRuby } from './slim.ruby';

export interface SlimDiagnosticRule {
    name: string;
    severity: vscode.DiagnosticSeverity;
    check: (node: SlimNode, document: vscode.TextDocument) => SlimDiagnostic | null;
}

export interface SlimDiagnostic {
    message: string;
    range: vscode.Range;
    severity: vscode.DiagnosticSeverity;
    code?: string;
    source: string;
}

export class SlimDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private rules: SlimDiagnosticRule[];

    // The rules that apply to lines of Ruby code (- and = lines); the others only apply to Slim
    private readonly RUBY_LINE_RULES = ['inconsistent-indentation', 'invalid-ruby-syntax', 'unclosed-brackets'];

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('slim');
        this.rules = this.initializeRules();
    }

    private initializeRules(): SlimDiagnosticRule[] {
        return [
            {
                name: 'invalid-tag-syntax',
                severity: vscode.DiagnosticSeverity.Error,
                check: this.checkInvalidTagSyntax.bind(this)
            },
            {
                name: 'unclosed-brackets',
                severity: vscode.DiagnosticSeverity.Error,
                check: this.checkUnclosedBrackets.bind(this)
            },
            {
                name: 'invalid-attribute-syntax',
                severity: vscode.DiagnosticSeverity.Error,
                check: this.checkInvalidAttributeSyntax.bind(this)
            },
            {
                name: 'inconsistent-indentation',
                severity: vscode.DiagnosticSeverity.Warning,
                check: this.checkInconsistentIndentation.bind(this)
            },
            {
                name: 'duplicate-id',
                severity: vscode.DiagnosticSeverity.Warning,
                check: this.checkDuplicateId.bind(this)
            },
            {
                name: 'empty-tag',
                severity: vscode.DiagnosticSeverity.Warning,
                check: this.checkEmptyTag.bind(this)
            },
            {
                name: 'invalid-ruby-syntax',
                severity: vscode.DiagnosticSeverity.Error,
                check: this.checkInvalidRubySyntax.bind(this)
            }
        ];
    }

    public provideDiagnostics(document: vscode.TextDocument): void {
        // Check if linting is enabled
        const config = vscode.workspace.getConfiguration('slim.linting');
        if (!config.get('enabled', true)) {
            this.diagnosticCollection.delete(document.uri);
            return;
        }

        try {
            const template = new SlimTemplate(document.getText());
            const diagnostics: vscode.Diagnostic[] = [];
            const usedIds = new Set<string>();

            this.validateTemplate(template, document, diagnostics, usedIds);

            this.diagnosticCollection.set(document.uri, diagnostics);
        } catch (error) {
            // If parsing fails completely, show a general error
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 0),
                `Failed to parse Slim template: ${error.message}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'slim';
            this.diagnosticCollection.set(document.uri, [diagnostic]);
        }
    }

    private validateTemplate(
        template: SlimTemplate,
        document: vscode.TextDocument,
        diagnostics: vscode.Diagnostic[],
        usedIds: Set<string>
    ): void {
        const config = vscode.workspace.getConfiguration('slim.linting');

        // Lines that continue a line of Ruby code, which are part of its code rather than Slim
        const continuationLines = new Set<number>();

        const lintNode = (node: SlimNode, ids: Set<string>) => {
            const isRuby = this.rubyCode(node.line) !== null;

            if (isRuby) {
                this.getContinuationLines(node, document).forEach(line => continuationLines.add(line));
            }

            // Apply all rules to this node based on configuration
            for (const rule of this.rules) {
                // Check if this rule should be applied based on configuration
                if (!this.shouldApplyRule(rule.name, config)) {
                    continue;
                }

                // Slim syntax rules don't apply to lines of Ruby code
                if (isRuby && !this.RUBY_LINE_RULES.includes(rule.name)) {
                    continue;
                }

                const result = rule.check(node, document);
                if (result) {
                    const diagnostic = new vscode.Diagnostic(
                        result.range,
                        result.message,
                        result.severity
                    );
                    diagnostic.source = result.source;
                    diagnostic.code = result.code;
                    diagnostics.push(diagnostic);
                }
            }

            // Track used IDs for duplicate detection (if enabled)
            if (node.id && !isRuby && config.get('validateIds', true)) {
                if (ids.has(node.id)) {
                    const diagnostic = this.createDuplicateIdDiagnostic(node, document);
                    if (diagnostic) diagnostics.push(diagnostic);
                } else {
                    ids.add(node.id);
                }
            }
        };

        const visitNode = (node: SlimNode, ids: Set<string>) => {
            // Comments and embedded engine blocks (javascript:, markdown:, ...) aren't Slim
            if (node.isBlockParentNode() || node.isBlockNode()) {
                return;
            }

            if (!continuationLines.has(node.lineNumber)) {
                lintNode(node, ids);
            }

            // The lines nested in a line of Ruby code (- if, = form_with ... do) are Slim
            visitChildren(node.children, ids);
        };

        const visitChildren = (children: SlimNode[], ids: Set<string>) => {
            // Only one branch of an if, unless or case renders, so each branch is checked for
            // duplicate IDs against the IDs before the conditional rather than the other branches
            let idsBeforeConditional: Set<string> | null = null;

            for (const child of children) {
                const code = child.line.startsWith('-') ? this.rubyCode(child.line) : null;

                if (idsBeforeConditional && code !== null && /^(elsif|else|when|in)\b/.test(code)) {
                    const branchIds = new Set(idsBeforeConditional);
                    visitNode(child, branchIds);
                    branchIds.forEach(id => ids.add(id));
                    continue;
                }

                idsBeforeConditional = code !== null && /^(if|unless|case)\b/.test(code) ? new Set(ids) : null;
                visitNode(child, ids);
            }
        };

        if (template.root && template.root.children) {
            visitChildren(template.root.children, usedIds);
        }
    }

    private checkInvalidTagSyntax(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        const line = node.line.trim();

        // Check for invalid tag names (must start with letter or be empty for div)
        if (node.tag && !/^[a-zA-Z][a-zA-Z0-9]*$/.test(node.tag)) {
            return {
                message: `Invalid tag name: '${node.tag}'. Tag names must start with a letter and contain only letters and numbers.`,
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'invalid-tag-syntax',
                source: 'slim'
            };
        }

        // Check for malformed tag syntax
        if (line.match(/^[^a-zA-Z#.\[\s\-=\/|'<*]/)) {
            return {
                message: "Invalid syntax. Lines must start with a tag name, #id, .class, [attributes], *, -, =, /, |, ' or <.",
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'invalid-tag-syntax',
                source: 'slim'
            };
        }

        return null;
    }

    private checkUnclosedBrackets(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        const rubyCode = this.getRubyCode(node, document);
        if (rubyCode !== null) {
            // An unclosed string hides the brackets after it, and invalid-ruby-syntax reports it
            const { quote, bracket } = scanRuby(rubyCode);
            if (quote || !bracket) return null;

            const name = { '(': 'parentheses', '[': 'square brackets', '{': 'curly braces' }[bracket];
            return {
                message: `Unclosed ${name}.`,
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'unclosed-brackets',
                source: 'slim'
            };
        }

        const line = node.line;
        let openBrackets = 0;
        let openParens = 0;
        let openBraces = 0;

        // If the line does not contain any brackets, return null
        if (!(line.includes('(') || line.includes('[') || line.includes('{'))) {
            return null;
        }

        const content = node.getFullContent();

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            if (char === '[') openBrackets++;
            else if (char === ']') openBrackets--;
            else if (char === '(') openParens++;
            else if (char === ')') openParens--;
            else if (char === '{') openBraces++;
            else if (char === '}') openBraces--;
        }

        if (openBrackets !== 0) {
            return {
                message: 'Unclosed square brackets in attributes.',
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'unclosed-brackets',
                source: 'slim'
            };
        }

        if (openParens !== 0) {
            return {
                message: 'Unclosed parentheses.',
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'unclosed-brackets',
                source: 'slim'
            };
        }

        if (openBraces !== 0) {
            return {
                message: 'Unclosed curly braces.',
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'unclosed-brackets',
                source: 'slim'
            };
        }

        return null;
    }

    private checkInvalidAttributeSyntax(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        const line = node.line;

        // Check for malformed attribute syntax
        const attrMatches = line.match(/\[([^\]]*)\]/g);
        if (attrMatches) {
            for (const match of attrMatches) {
                const content = match.substring(1, match.length - 1);

                // Check for empty attributes
                if (content.trim() === '') {
                    return {
                        message: 'Empty attribute brackets are not allowed.',
                        range: this.getNodeRange(node, document),
                        severity: vscode.DiagnosticSeverity.Error,
                        code: 'invalid-attribute-syntax',
                        source: 'slim'
                    };
                }

                // Check for malformed key=value pairs
                const pairs = content.split(/\s+/);
                for (const pair of pairs) {
                    if (pair.includes('=')) {
                        const [key, ...valueParts] = pair.split('=');
                        if (!key || key.trim() === '') {
                            return {
                                message: 'Attribute name cannot be empty.',
                                range: this.getNodeRange(node, document),
                                severity: vscode.DiagnosticSeverity.Error,
                                code: 'invalid-attribute-syntax',
                                source: 'slim'
                            };
                        }

                        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(key.trim())) {
                            return {
                                message: `Invalid attribute name: '${key.trim()}'. Attribute names must start with a letter.`,
                                range: this.getNodeRange(node, document),
                                severity: vscode.DiagnosticSeverity.Error,
                                code: 'invalid-attribute-syntax',
                                source: 'slim'
                            };
                        }
                    }
                }
            }
        }

        return null;
    }

    private checkInconsistentIndentation(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        // Get configuration for expected indentation
        const config = vscode.workspace.getConfiguration('slim');
        const expectedIndentSize = config.get('indentSize', 2) as number;
        const useTabs = config.get('useTab', false) as boolean;

        const line = document.lineAt(node.lineNumber - 1).text;
        const leadingWhitespace = line.match(/^(\s*)/)?.[1] || '';

        if (useTabs) {
            // Check if using spaces when tabs are expected
            if (leadingWhitespace.includes(' ')) {
                return {
                    message: 'Inconsistent indentation: expected tabs but found spaces.',
                    range: new vscode.Range(node.lineNumber - 1, 0, node.lineNumber - 1, leadingWhitespace.length),
                    severity: vscode.DiagnosticSeverity.Warning,
                    code: 'inconsistent-indentation',
                    source: 'slim'
                };
            }
        } else {
            // Check if using tabs when spaces are expected
            if (leadingWhitespace.includes('\t')) {
                return {
                    message: 'Inconsistent indentation: expected spaces but found tabs.',
                    range: new vscode.Range(node.lineNumber - 1, 0, node.lineNumber - 1, leadingWhitespace.length),
                    severity: vscode.DiagnosticSeverity.Warning,
                    code: 'inconsistent-indentation',
                    source: 'slim'
                };
            }

            // Check if indentation is not a multiple of expected size
            const spaceCount = leadingWhitespace.length;
            if (spaceCount > 0 && spaceCount % expectedIndentSize !== 0) {
                return {
                    message: `Inconsistent indentation: expected multiples of ${expectedIndentSize} spaces.`,
                    range: new vscode.Range(node.lineNumber - 1, 0, node.lineNumber - 1, leadingWhitespace.length),
                    severity: vscode.DiagnosticSeverity.Warning,
                    code: 'inconsistent-indentation',
                    source: 'slim'
                };
            }
        }

        return null;
    }

    private checkDuplicateId(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        // This is handled in the main validation loop to track IDs across the document
        return null;
    }

    private createDuplicateIdDiagnostic(node: SlimNode, document: vscode.TextDocument): vscode.Diagnostic | null {
        if (!node.id) return null;

        return new vscode.Diagnostic(
            this.getNodeRange(node, document),
            `Duplicate ID '${node.id}'. IDs must be unique within the document.`,
            vscode.DiagnosticSeverity.Warning
        );
    }

    private checkEmptyTag(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        const line = node.line.trim();

        // Check for lines that are just whitespace or only contain selectors without content
        if (line.match(/^[#.][a-zA-Z0-9_-]*\s*$/) && !line.includes('[') && !node.children.length) {
            return {
                message: 'Empty tag with only selectors. Consider adding content or removing the line.',
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Warning,
                code: 'empty-tag',
                source: 'slim'
            };
        }

        return null;
    }

    private checkInvalidRubySyntax(node: SlimNode, document: vscode.TextDocument): SlimDiagnostic | null {
        const code = this.rubyCode(node.line);
        if (code === null) return null;

        // Slim closes Ruby blocks by indentation and rejects an explicit end
        if (node.line.startsWith('-') && /^end\b/.test(code)) {
            return {
                message: "Explicit 'end' is not allowed. Slim closes Ruby blocks by indentation.",
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'invalid-ruby-syntax',
                source: 'slim'
            };
        }

        const { quote } = scanRuby(this.getRubyCode(node, document));

        if (quote) {
            const name = { "'": 'single quote', '"': 'double quote', '`': 'backtick' }[quote];
            return {
                message: `Unmatched ${name} in Ruby code.`,
                range: this.getNodeRange(node, document),
                severity: vscode.DiagnosticSeverity.Error,
                code: 'invalid-ruby-syntax',
                source: 'slim'
            };
        }

        return null;
    }

    // The Ruby code of a control (-) or output (=, ==, =>, =<) line, or null for other lines
    private rubyCode(line: string): string | null {
        const match = line.match(/^(?:-|==?[<>']*)\s*(.*)$/);
        return match ? match[1] : null;
    }

    // The Ruby code of a control or output line, including the lines that continue it, or null
    // for other lines
    private getRubyCode(node: SlimNode, document: vscode.TextDocument): string | null {
        const code = this.rubyCode(node.line);
        if (code === null) return null;

        const continuation = this.getContinuationLines(node, document).map(line => document.lineAt(line - 1).text);
        return [code, ...continuation].join('\n');
    }

    // Slim continues a line of Ruby code that ends in , or \ onto the next line. Returns the
    // 1-based numbers of the lines that continue the node's line.
    private getContinuationLines(node: SlimNode, document: vscode.TextDocument): number[] {
        const lines: number[] = [];
        let text = node.line;
        let lineNumber = node.lineNumber;

        while (/[,\\]$/.test(text) && lineNumber < document.lineCount) {
            lineNumber++;
            lines.push(lineNumber);
            text = document.lineAt(lineNumber - 1).text.trim();
        }

        return lines;
    }

    private getNodeRange(node: SlimNode, document: vscode.TextDocument): vscode.Range {
        const lineIndex = node.lineNumber - 1;
        const line = document.lineAt(lineIndex);
        const startChar = line.text.length - line.text.trimLeft().length;
        return new vscode.Range(lineIndex, startChar, lineIndex, line.text.length);
    }

    private shouldApplyRule(ruleName: string, config: vscode.WorkspaceConfiguration): boolean {
        switch (ruleName) {
            case 'invalid-tag-syntax':
            case 'unclosed-brackets':
            case 'invalid-attribute-syntax':
                return config.get('validateSyntax', true);
            case 'inconsistent-indentation':
                return config.get('validateIndentation', true);
            case 'invalid-ruby-syntax':
                return config.get('validateRuby', true);
            case 'duplicate-id':
                return config.get('validateIds', true);
            case 'empty-tag':
                return config.get('warnEmptyTags', false);
            default:
                return true;
        }
    }

    public dispose(): void {
        this.diagnosticCollection.dispose();
    }
}
