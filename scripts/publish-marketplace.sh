#!/bin/bash

# Script to publish Slim VS Code extension to marketplace
# This script helps prepare and publish the extension

set -e

echo "🚀 Preparing Slim VS Code Extension for marketplace publication..."

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce is not installed. Installing..."
    npm install -g @vscode/vsce
fi

# Clean and build
echo "📦 Building extension..."
npm run compile

# Run tests
echo "🧪 Running tests..."
npm test

# Package the extension
echo "📦 Packaging extension..."
npm run package

# Get the generated .vsix file
VSIX_FILE=$(ls *.vsix | head -1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found. Build failed."
    exit 1
fi

echo "✅ Extension packaged successfully: $VSIX_FILE"

# Check package size
PACKAGE_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
echo "📊 Package size: $PACKAGE_SIZE"

# Instructions for publishing
echo ""
echo "🎯 Next steps to publish to VS Code Marketplace:"
echo ""
echo "1. Create a Microsoft Partner Center account:"
echo "   https://partner.microsoft.com"
echo ""
echo "2. Get a Personal Access Token (PAT):"
echo "   https://dev.azure.com"
echo ""
echo "3. Login to vsce:"
echo "   vsce login <publisher-name>"
echo ""
echo "4. Publish the extension:"
echo "   vsce publish"
echo ""
echo "5. For Open VSX Registry (already verified):"
echo "   ovsx publish $VSIX_FILE"
echo ""
echo "📝 Note: First-time publishers may need manual review on VS Code Marketplace."
echo "   Open VSX Registry is recommended for immediate availability."
