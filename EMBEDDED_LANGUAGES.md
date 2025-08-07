# Embedded Languages in Slim VS Code Extension

This document explains how the Slim VS Code extension handles embedded languages like JavaScript, CSS, SCSS, and Ruby within Slim templates.

## Overview

The extension provides proper syntax highlighting and language support for embedded code blocks while maintaining Slim's template structure. This is achieved through a combination of:

1. **Semantic Token Provider**: Skips processing embedded language blocks
2. **TextMate Grammar**: Provides syntax highlighting for embedded languages
3. **Language Detection**: Identifies embedded language blocks

## Supported Embedded Languages

The extension supports the following embedded languages:

- **JavaScript**: `javascript:` blocks
- **CSS**: `css:` blocks
- **SCSS**: `scss:` blocks
- **Ruby**: `ruby:` blocks
- **Inline Ruby**: Code after `=` symbols (e.g., `= f.password_field :password`)

## How It Works

### 1. Semantic Token Provider

The semantic token provider (`src/slim.semantic.token.provider.ts`) detects embedded language blocks and inline Ruby code, then skips processing them:

```typescript
private detectEmbeddedLanguageBlocks(document: vscode.TextDocument): Array<{ startLine: number, endLine: number, language: string }> {
    const blocks: Array<{ startLine: number, endLine: number, language: string }> = [];
    const lines = document.getText().split('\n');

    let currentBlock: { startLine: number, language: string } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check for embedded language start
        if (line === 'javascript:' || line === 'css:' || line === 'scss:' || line === 'ruby:') {
            const language = line.replace(':', '');
            currentBlock = { startLine: i + 1, language };
        }
        // Check for embedded language end
        else if (line === 'end' && currentBlock) {
            blocks.push({
                startLine: currentBlock.startLine,
                endLine: i + 1,
                language: currentBlock.language
            });
            currentBlock = null;
        }
    }

    return blocks;
}
```

### 2. TextMate Grammar

The TextMate grammar (`syntaxes/slim.tmLanguage.json`) provides syntax highlighting for embedded languages:

```json
{
  "name": "source.ruby.embedded.slim",
  "begin": "^\\s*(ruby:)",
  "end": "^\\s*(end)",
  "beginCaptures": {
    "1": { "name": "keyword.control.ruby.slim" }
  },
  "endCaptures": {
    "1": { "name": "keyword.control.ruby.slim" }
  },
  "contentName": "source.ruby",
  "patterns": [
    {
      "name": "source.ruby",
      "match": ".*"
    }
  ]
}
```

The `contentName` property ensures that all content within the block is treated as Ruby code, providing proper syntax highlighting for multi-line Ruby blocks.

### 3. Language Detection in SlimNode

The `SlimNode` class (`src/slim.node.ts`) detects embedded languages during parsing:

```typescript
if (trimmed == 'javascript:') {
    this.type = "javascript";
    return;
}

if (trimmed == 'css:') {
    this.type = "css";
    return;
}

if (trimmed == 'scss:') {
    this.type = "css";
    return;
}
```

### 4. Inline Ruby Code Detection

The semantic token provider also detects inline Ruby code that appears after `=` symbols:

```typescript
private detectInlineRubyRanges(document: vscode.TextDocument): Array<{ lineNumber: number, startChar: number, endChar: number }> {
    const ranges: Array<{ lineNumber: number, startChar: number, endChar: number }> = [];
    const lines = document.getText().split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Check for inline Ruby code (starts with =)
        if (trimmed.startsWith('=')) {
            const equalsIndex = line.indexOf('=');
            if (equalsIndex !== -1) {
                // Find the start of Ruby code (after = and any whitespace)
                let rubyStart = equalsIndex + 1;
                while (rubyStart < line.length && /\s/.test(line[rubyStart])) {
                    rubyStart++;
                }

                if (rubyStart < line.length) {
                    ranges.push({
                        lineNumber: i + 1,
                        startChar: rubyStart,
                        endChar: line.length
                    });
                }
            }
        }
    }

    return ranges;
}
```

## Usage Examples

### JavaScript Blocks

```slim
javascript:
  // JavaScript code embedded in Slim
  function greetUser(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome to our site, ' + name;
  }

  // Event handling
  document.addEventListener('DOMContentLoaded', function() {
    const button = document.querySelector('#greet-button');
    if (button) {
      button.addEventListener('click', function() {
        const name = prompt('Enter your name:');
        if (name) {
          alert(greetUser(name));
        }
      });
    }
  });
```

### CSS Blocks

```slim
css:
  /* Custom styles for this page */
  .highlight {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 10px;
    margin: 10px 0;
  }

  .success {
    color: #155724;
    background-color: #d4edda;
    border-color: #c3e6cb;
  }
```

### SCSS Blocks

```slim
scss:
  // SCSS with nested rules and variables
  $primary-color: #007bff;
  $secondary-color: #6c757d;
  $border-radius: 4px;

  .card {
    background: white;
    border-radius: $border-radius;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    padding: 20px;
    margin: 10px 0;

    .card-header {
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 10px;
      margin-bottom: 15px;

      h3 {
        color: $primary-color;
        margin: 0;
      }
    }
  }
```

### Ruby Blocks

```slim
ruby:
  # Ruby code embedded in Slim
  users = [
    { name: 'Alice', role: 'admin', email: 'alice@example.com' },
    { name: 'Bob', role: 'user', email: 'bob@example.com' },
    { name: 'Charlie', role: 'moderator', email: 'charlie@example.com' }
  ]

  def format_user_info(user)
    "#{user[:name]} (#{user[:role]}) - #{user[:email]}"
  end

  def get_users_by_role(users, role)
    users.select { |user| user[:role] == role }
  end
```

### Inline Ruby Code

```slim
= f.password_field :password,
 autocomplete: "off",
 placeholder: "Password",
 class: password_class

= f.text_field :email,
 autocomplete: "email",
 placeholder: "Email address",
 class: email_class

= f.submit "Sign In",
 class: "btn btn-primary",
 data: { disable_with: "Signing in..." }

= link_to "Forgot Password?",
 new_password_reset_path,
 class: "forgot-password-link"

= render partial: "shared/flash_messages"
```

## Benefits

1. **Proper Syntax Highlighting**: Embedded code gets the correct syntax highlighting for its language
2. **IntelliSense Support**: VS Code provides IntelliSense for embedded languages
3. **Error Detection**: Syntax errors in embedded code are properly detected
4. **Language-Specific Features**: Features like auto-completion work for embedded languages
5. **Maintains Slim Structure**: The overall Slim template structure is preserved

## Implementation Details

### Token Mapping

Embedded languages are mapped to appropriate token types in `src/slim.node.ts`:

```typescript
const TOKEN_MAP = {
    'css': 'namespace',
    'css-block': 'text',
    'javascript': 'namespace',
    'javascript-block': 'text',
    'scss': 'namespace',
    'scss-block': 'text',
    // ... other tokens
};
```

### Block Detection

The semantic token provider uses a two-step process:

1. **Detection**: Scans the document for embedded language blocks
2. **Filtering**: Skips semantic token processing for lines within embedded blocks

This allows VS Code's built-in language services to handle the embedded content while the semantic token provider focuses on Slim-specific syntax.

## Testing

You can test embedded language support by:

1. Opening a `.slim` file with embedded language blocks
2. Verifying that embedded code has proper syntax highlighting
3. Checking that IntelliSense works for embedded languages
4. Confirming that syntax errors are detected in embedded code

See `examples/embedded-languages.slim` for a comprehensive example.
