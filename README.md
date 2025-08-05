# Slim/Trim Language Support for VS Code

A comprehensive VS Code extension that provides syntax highlighting, formatting and code folding for Slim and Trim templates.

## Features

### Syntax Highlighting
- **HTML Elements**: Proper highlighting for all HTML tags
- **Attributes**: Support for ID (#) and class (.) selectors
- **Ruby Code**: Embedded Ruby code with proper syntax highlighting
- **Comments**: Support for both line (//) and block comments
- **Text Content**: Proper highlighting for text content with pipe (|) syntax
- **Doctype**: Special highlighting for doctype declarations

### Formatting
- **Auto-indentation**: Automatic indentation based on Slim structure
- **Configurable indentation**: Support for both spaces and tabs
- **Format on Save**: Option to automatically format files when saving
- **Range Formatting**: Format specific sections of code
- **On-type Formatting**: Auto-indent when pressing Enter

### Code Folding
- **Intelligent Folding**: Automatic folding ranges based on content structure
- **Block-based Folding**: Folds blocks with more than 5 lines by default
- **Configurable Threshold**: Adjustable minimum line count for folding via settings
- **Nested Folding**: Supports nested folding ranges for complex templates
- **Visual Indicators**: Clear fold markers for easy navigation

## Installation

### From Source
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` in VS Code to launch the extension in a new window

### From VSIX
1. Build the extension: `npm run compile`
2. Package the extension: `vsce package`
3. Install the generated `.vsix` file in VS Code

## Configuration

The extension provides several configuration options:

```json
{
  "slim.indentSize": 2,        // Number of spaces for indentation
  "slim.useTab": false,        // Use tabs instead of spaces
  "slim.formatOnSave": true,   // Format files automatically on save
  "slim.codeFoldingDepth": 5   // Minimum number of lines for folding ranges
}
```

## Usage

### Basic Slim Template
```slim
doctype html
html
  head
    title My Website
    meta[name="viewport" content="width=device-width, initial-scale=1.0"]
  body
    section#header
      h1.a.b.c#abc Hello, World!

      p#article.read.highlight data-id="123" This is a simple website.

        ul#list-of-items
          li.one style="color: red;" One
          li.two Two
          li.three Three

        div#footer
          p#copyright Copyright 2025

```

### Formatting Commands
- `Format Document` (Shift+Alt+F): Format the entire document
- `Format Selection` (Ctrl+K Ctrl+F): Format selected text
- Auto-format on save (if enabled)

### Code Folding
The extension automatically creates folding ranges for blocks with sufficient content:

```slim
doctype html
html                    # ← Folds entire document (14 lines)
  head
    title My Website
    meta[name="viewport" content="width=device-width, initial-scale=1.0"]
  body                  # ← Folds body content (10 lines)
    section#header      # ← Folds section content (9 lines)
      h1.a.b.c#abc Hello, World!
      p#article.read.highlight data-id="123" This is a simple website.
        ul#list-of-items
          li.one style="color: red;" One
          li.two Two
          li.three Three
        div#footer
          p#copyright Copyright 2025
```

**Folding Behavior:**
- Blocks with 5+ lines automatically get folding ranges
- Nested blocks create multiple folding levels
- Smaller blocks (≤5 lines) remain unfolded for quick access
- Adjust the threshold via `slim.codeFoldingDepth` setting

## Supported File Types
- `.slim` files
- `.trim` files

## Requirements
- VS Code 1.60.0 or higher

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Changelog

### 0.0.6
- improve syntax highlighting to cover multi-line comments

### 0.0.5
- Added intelligent code folding based on content structure
- Automatic folding ranges for blocks
- Configurable folding threshold via settings
- Nested folding support for complex templates

### 0.0.4
- Configurable formatting options
- Support for both .slim and .trim file extensions

### 0.0.3
- Document and range formatting
- Auto-indentation support

### 0.0.2
- Syntax highlighting for Slim and Trim templates

### 0.0.1
- Initial alpha release
