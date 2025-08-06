# Marketing Assets for Slim VS Code Extension

This directory contains marketing assets for your VS Code extension.

## Required Files

### 1. Icon (Required)
- **File**: `icon.png`
- **Size**: 128x128 pixels
- **Format**: PNG
- **Purpose**: Displayed in the VS Code marketplace and extension list

### 2. Screenshots (Recommended)
- **Files**: `screenshot-1.png`, `screenshot-2.png`
- **Size**: 1280x720 pixels (16:9 ratio)
- **Format**: PNG
- **Purpose**: Show your extension in action on the marketplace

## Creating the Assets

### Convert SVG to PNG
You can convert the provided `icon.svg` to PNG using:
```bash
# Using ImageMagick (if installed)
convert icon.svg icon.png

# Or using online tools like:
# - https://convertio.co/svg-png/
# - https://cloudconvert.com/svg-to-png
```

### Taking Screenshots
1. Open VS Code with your extension
2. Open a `.slim` file
3. Take screenshots showing:
   - Syntax highlighting
   - Code folding
   - Formatting features
   - Any other key features

### Screenshot Tips
- Use a dark theme for better visual appeal
- Show realistic Slim code examples
- Highlight the features your extension provides
- Keep the interface clean and uncluttered

## Additional Marketing Fields

You can also add these optional fields to your `package.json`:

```json
{
  "homepage": "https://github.com/your-username/slim-vscode-extension",
  "bugs": {
    "url": "https://github.com/your-username/slim-vscode-extension/issues"
  },
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "contributors": [
    {
      "name": "Contributor Name",
      "email": "contributor@example.com"
    }
  ]
}
```

## Marketplace Optimization

1. **Description**: Make it compelling and feature-focused
2. **Keywords**: Include relevant search terms
3. **Categories**: Choose appropriate categories
4. **Badges**: Add status badges for version, downloads, etc.
5. **Repository**: Link to your GitHub repository
6. **Issues**: Link to your issue tracker

## Testing Your Extension

Before publishing:
1. Test locally: `vsce package`
2. Install the `.vsix` file in VS Code
3. Verify all features work as expected
4. Check that marketing assets display correctly
