# Slim/Trim Language Support for VS Code

## Installation Options

### Option 1: Install from Open VSX Registry (Recommended)
Since this extension is verified on Open VSX Registry, you can install it directly:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu in the Extensions panel
4. Select "Install from VSIX..."
5. Enter the URL: `https://open-vsx.org/extension/opensourceame/slim-vscode-extension`

### Option 2: Manual Installation
If you encounter publisher trust issues:

1. Download the `.vsix` file from the [releases page](https://github.com/opensourceame/slim-vscode-extension/releases)
2. In VS Code, go to Extensions (Ctrl+Shift+X)
3. Click the "..." menu and select "Install from VSIX..."
4. Choose the downloaded `.vsix` file

### Option 3: Build from Source
For advanced users:

```bash
git clone https://github.com/opensourceame/slim-vscode-extension.git
cd slim-vscode-extension
npm install
npm run compile
npm run package
```

Then install the generated `.vsix` file.

## Publisher Trust Information

This extension is published by `opensourceame` and is:
- ✅ **Verified on Open VSX Registry** (open-vsx.org)
- 🔄 **Pending verification on VS Code Marketplace**

The publisher trust issue you may see is because VS Code Marketplace and Open VSX Registry are separate platforms with different verification processes. The extension is fully functional and safe to install.

## Features

- **Syntax Highlighting**: Full support for Slim/Trim syntax
- **Code Formatting**: Automatic indentation and formatting
- **Code Folding**: Intelligent folding of template blocks
- **Language Support**: Support for `.slim` and `.trim` files

## Support

- **Issues**: [GitHub Issues](https://github.com/opensourceame/slim-vscode-extension/issues)
- **Documentation**: [GitHub README](https://github.com/opensourceame/slim-vscode-extension)
- **License**: MIT License

## Version History

See [CHANGELOG.md](https://github.com/opensourceame/slim-vscode-extension/blob/main/CHANGELOG.md) for detailed version history.
