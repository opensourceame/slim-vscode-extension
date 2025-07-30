# Slim Language Support for VS Code

A comprehensive VS Code extension that provides both syntax highlighting and formatting for Slim templates.

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
  "slim.formatOnSave": true    // Format files automatically on save
}
```

## Usage

### Basic Slim Template
```slim
doctype html
html
  head
    title My Page
    css:
      body { margin: 0; }

  body
    h1 Hello World
    p This is a paragraph
    | This is plain text

    ruby:
      users.each do |user|
        puts user.name
```

### Formatting Commands
- `Format Document` (Shift+Alt+F): Format the entire document
- `Format Selection` (Ctrl+K Ctrl+F): Format selected text
- Auto-format on save (if enabled)

## Supported File Types
- `.slim` files

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

### 1.0.0
- Initial release
- Syntax highlighting for Slim templates
- Document and range formatting
- Auto-indentation support
- Configurable formatting options