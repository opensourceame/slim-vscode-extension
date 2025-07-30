#!/bin/bash

# Build the extension
echo "Building the extension..."
npm run compile

# Install vsce locally if not already installed
if ! npm list @vscode/vsce &> /dev/null; then
    echo "Installing vsce (VS Code Extension Manager)..."
    npm install --save-dev @vscode/vsce
fi

# Package the extension
echo "Packaging the extension..."
npx vsce package

# Find the generated .vsix file
VSIX_FILE=$(ls *.vsix 2>/dev/null | head -1)

if [ -n "$VSIX_FILE" ]; then
    echo "Extension packaged as: $VSIX_FILE"
    echo ""
    echo "To install the extension in VS Code:"
    echo "1. Open VS Code"
    echo "2. Go to Extensions (Ctrl+Shift+X)"
    echo "3. Click the '...' menu and select 'Install from VSIX...'"
    echo "4. Select the file: $VSIX_FILE"
    echo ""
    echo "Or install from command line:"
    echo "code --install-extension $VSIX_FILE"
else
    echo "Error: Failed to create VSIX package"
    exit 1
fi