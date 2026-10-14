const CLOSING_BRACKETS = { ')': '(', ']': '[', '}': '{' };

// Scan Ruby code for string literals and brackets that aren't closed. Returns the quote
// character of the innermost unclosed string, and the opening bracket of the first closing
// bracket without a match or, failing that, of the innermost unclosed bracket. Handles
// escapes, #{} interpolation and comments, but not %-literals, regexps, character literals
// or heredocs.
export function scanRuby(code: string): { quote: string | null, bracket: string | null } {
    // Open strings, brackets and #{ interpolations, innermost last
    const stack: string[] = [];
    let unmatched: string | null = null;

    for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const top = stack[stack.length - 1];

        if (top === '"' || top === "'" || top === '`') {
            if (char === '\\') {
                i++;
            } else if (char === top) {
                stack.pop();
            } else if (top !== "'" && char === '#' && code[i + 1] === '{') {
                stack.push('#{');
                i++;
            }
            continue;
        }

        if (char === '"' || char === "'" || char === '`' || char === '(' || char === '[' || char === '{') {
            stack.push(char);
        } else if (char in CLOSING_BRACKETS) {
            const opening = CLOSING_BRACKETS[char];
            if (top === opening || (char === '}' && top === '#{')) {
                stack.pop();
            } else if (!unmatched) {
                unmatched = opening;
            }
        } else if (char === '#') {
            // A comment runs to the end of the line
            const newline = code.indexOf('\n', i);
            if (newline === -1) {
                break;
            }
            i = newline;
        }
    }

    const open = stack.reverse();

    return {
        quote: open.find(entry => entry === '"' || entry === "'" || entry === '`') || null,
        bracket: unmatched || open.find(entry => entry === '(' || entry === '[' || entry === '{') || null,
    };
}
