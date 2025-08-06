# Screenshot Template for Slim Extension

## Screenshot 1: Syntax Highlighting and Code Folding
**File**: `screenshot-1.png`
**Description**: "Slim syntax highlighting and code folding"

**What to capture**:
- Open a `.slim` file with complex nested structure
- Show syntax highlighting working (tags, attributes, text)
- Show code folding in action (collapsed sections)
- Use a dark theme for better visual appeal
- Include realistic Slim code like:

```slim
doctype html
html
  head
    title Slim Template
    meta name="viewport" content="width=device-width, initial-scale=1"
    link rel="stylesheet" href="/styles.css"
  body
    header
      h1 Welcome to Slim
      nav
        ul
          li
            a href="/" Home
          li
            a href="/about" About
    main
      section.content
        h2 Features
        ul
          li Clean syntax
          li Code folding
          li Formatting
          li Syntax highlighting
    footer
      p &copy; 2025 David Kelly - MIT license
```

## Screenshot 2: Formatting and Indentation
**File**: `screenshot-2.png`
**Description**: "Slim formatting and indentation"

**What to capture**:
- Show before/after formatting
- Demonstrate proper indentation
- Show formatting options in action
- Include the command palette with Slim commands visible
- Show configuration options

## Screenshot Tips

### Technical Requirements
- **Resolution**: 1280x720 pixels (16:9 ratio)
- **Format**: PNG
- **File size**: Keep under 1MB each
- **Quality**: High quality, crisp text

### Visual Guidelines
- Use VS Code's default dark theme
- Keep the interface clean and uncluttered
- Focus on the editor area
- Show the file extension (.slim) in the tab
- Include the language mode indicator showing "Slim"

### Content Guidelines
- Use realistic, production-like Slim code
- Show multiple features in each screenshot
- Highlight the benefits of your extension
- Make the code readable and well-formatted

### Tools for Taking Screenshots
- **macOS**: Cmd+Shift+4 for area selection
- **Windows**: Snipping Tool or Win+Shift+S
- **Linux**: Use your system's screenshot tool
- **VS Code**: You can also use the built-in screenshot feature

## Example Code for Screenshots

### Complex Template Example
```slim
doctype html
html lang="en"
  head
    meta charset="utf-8"
    meta name="viewport" content="width=device-width, initial-scale=1"
    title = page_title
    = stylesheet_link_tag "application", media: "all"
    = javascript_include_tag "application"
    = csrf_meta_tags
  body class=body_class
    header.main-header
      .container
        .logo
          = link_to "MyApp", root_path
        nav.main-nav
          ul
            li = link_to "Home", root_path
            li = link_to "About", about_path
            li = link_to "Contact", contact_path
    main.content
      .container
        - if flash[:notice]
          .alert.alert-success = flash[:notice]
        - if flash[:error]
          .alert.alert-danger = flash[:error]
        = yield
    footer.main-footer
      .container
        p &copy; 2025 David Kelly - MIT license
```

This template will help you create professional-looking screenshots that effectively showcase your extension's features.
