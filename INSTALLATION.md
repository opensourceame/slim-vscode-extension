# Slim VSCode Extension Installation Guide

## Quick Installation

1. **Build and Package the Extension:**
   ```bash
   cd slim-vscode-extension
   ./install.sh
   ```

2. **Install in VS Code:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click the '...' menu and select 'Install from VSIX...'
   - Select the generated `slim-vscode-extension-1.0.0.vsix` file

   Or use the command line:
   ```bash
   code --install-extension slim-vscode-extension-1.0.0.vsix
   ```

## Features

### ✅ Syntax Highlighting
- HTML elements and tags
- ID (#) and class (.) selectors
- Ruby code blocks
- Comments (// and /)
- Text content with pipe (|) syntax
- Doctype declarations

### ✅ Formatting
- Auto-indentation
- Configurable indentation (spaces/tabs)
- Format on save
- Range formatting
- On-type formatting

### ✅ Configuration Options
```json
{
  "slim.indentSize": 2,        // Number of spaces for indentation
  "slim.useTab": false,        // Use tabs instead of spaces
  "slim.formatOnSave": true    // Format files automatically on save
}
```

## Usage

### Formatting Commands
- `Format Document` (Shift+Alt+F): Format the entire document
- `Format Selection` (Ctrl+K Ctrl+F): Format selected text
- Auto-format on save (if enabled)

### Sample Slim Template
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

## Development

### Building from Source
```bash
npm install
npm run compile
```

### Running in Development Mode
1. Open the extension folder in VS Code
2. Press F5 to launch a new VS Code window with the extension
3. Open a `.slim` file to test the extension

### Testing
- Open the `sample.slim` file to see syntax highlighting
- Try formatting the document (Shift+Alt+F)
- Test auto-indentation by pressing Enter

## Troubleshooting

### Extension Not Working
1. Make sure the extension is installed and enabled
2. Check that you're opening `.slim` files
3. Restart VS Code if needed

### Formatting Issues
1. Check your VS Code settings for Slim configuration
2. Ensure the file has a `.slim` extension
3. Try manually formatting with Shift+Alt+F

### Syntax Highlighting Issues
1. Verify the file extension is `.slim`
2. Check if the language mode is set to "Slim"
3. Restart VS Code if highlighting doesn't appear

## Uninstalling

To uninstall the extension:
1. Go to Extensions (Ctrl+Shift+X)
2. Find "Slim Language Support"
3. Click the gear icon and select "Uninstall"

Or use the command line:
```bash
code --uninstall-extension slim-support.slim-vscode-extension
```