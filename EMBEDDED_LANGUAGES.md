# Embedded Language Support in Slim Extension

This extension provides embedded language support for Ruby code sections in Slim files, allowing VS Code to use Ruby language features (syntax highlighting, formatting, IntelliSense, etc.) for specific sections of your Slim templates.

## How It Works

### Semantic Tokens with Embedded Language Modifiers

The extension uses VS Code's semantic tokens with the `embeddedLanguage` modifier to tell VS Code that certain sections should be treated as Ruby code. This approach:

1. **Identifies Ruby Code Sections**: The semantic token provider identifies sections that contain Ruby code:
   - Lines starting with `= ` (output Ruby)
   - Lines starting with `- ` (control Ruby)
   - Ruby blocks and expressions

2. **Marks as Embedded Language**: These sections are marked with the `embeddedLanguage` modifier, which tells VS Code to:
   - Use Ruby syntax highlighting
   - Apply Ruby formatting rules
   - Provide Ruby IntelliSense and autocomplete
   - Use Ruby language server features

3. **Delegates Formatting**: When formatting is requested, Ruby sections are delegated to the Ruby formatter while Slim sections use the Slim formatter.

## Supported Ruby Code Patterns

The extension recognizes and treats the following as embedded Ruby code:

### Output Ruby (`=`)
```slim
h1 = "Welcome to Slim"
p = "Hello, #{current_user.name}!"
= link_to "Login", login_path, class: "btn btn-primary"
```

### Control Ruby (`-`)
```slim
- if user_signed_in?
  p = "Hello, #{current_user.name}!"
- else
  p = "Please sign in"
```

### Ruby Blocks
```slim
- posts.each do |post|
  .post
    h2 = post.title
    p = post.content
```

### Ruby Expressions in Attributes
```slim
meta name="viewport" content="width=device-width, initial-scale=1"
= stylesheet_link_tag "application", media: "all"
```

## Features

### Syntax Highlighting
- Ruby code sections will be highlighted using Ruby syntax highlighting
- Variables, methods, and Ruby keywords will be properly colored
- String interpolation (`#{...}`) will be highlighted as Ruby

### Formatting
- When you format a Slim file, Ruby sections will be formatted using Ruby formatting rules
- Slim sections will be formatted using Slim formatting rules
- The extension automatically detects which sections should use which formatter

### IntelliSense and Autocomplete
- Ruby code sections will have Ruby IntelliSense
- Method suggestions, variable completion, and Ruby-specific features will work
- Requires a Ruby language server to be installed (like Solargraph or Ruby LSP)

### Language Server Integration
- Ruby language servers can provide features like:
  - Go to definition
  - Find references
  - Hover information
  - Error diagnostics
  - Code actions

## Configuration

The embedded language support is automatically enabled when you have:

1. **This Slim extension** installed and active
2. **A Ruby language server** installed (recommended: Solargraph or Ruby LSP)

### Recommended Ruby Language Servers

#### Solargraph
```bash
gem install solargraph
```

#### Ruby LSP
```bash
gem install ruby-lsp
```

## Example Usage

Here's a complete example showing how embedded Ruby works:

```slim
doctype html
html
  head
    title = "My Slim Page"
    meta name="viewport" content="width=device-width, initial-scale=1"
    = stylesheet_link_tag "application", media: "all"
    = javascript_include_tag "application"

  body
    .container
      h1 = "Welcome to Slim"

      - if user_signed_in?
        p = "Hello, #{current_user.name}!"
        = link_to "Logout", logout_path, method: :delete, class: "btn btn-danger"
      - else
        p = "Please sign in to continue"
        = link_to "Login", login_path, class: "btn btn-primary"

      .content
        - posts.each do |post|
          .post
            h2 = post.title
            p = post.content
            - if post.published?
              span.badge.badge-success Published
            - else
              span.badge.badge-warning Draft
```

In this example:
- All lines starting with `= ` will be treated as Ruby code
- All lines starting with `- ` will be treated as Ruby code
- Ruby expressions like `#{current_user.name}` will be highlighted as Ruby
- When formatting, Ruby sections will use Ruby formatting rules

## Technical Implementation

The extension implements this using:

1. **Semantic Token Provider**: Identifies Ruby code sections and marks them with the `embeddedLanguage` modifier
2. **Range Formatting Provider**: Delegates Ruby sections to the Ruby formatter
3. **Language Configuration**: Tells VS Code about embedded language support

This approach provides seamless integration without requiring TextMate grammars, making it more maintainable and performant.

## Troubleshooting

### Ruby IntelliSense Not Working
- Ensure you have a Ruby language server installed (Solargraph or Ruby LSP)
- Check that the language server is properly configured in VS Code
- Verify that your Ruby environment is set up correctly

### Formatting Issues
- Make sure you have a Ruby formatter configured
- Check that the Ruby language server is providing formatting capabilities
- Try formatting individual Ruby sections to isolate issues

### Performance Issues
- The semantic token provider is optimized for performance
- Large files may experience slight delays during initial token analysis
- Consider breaking large templates into smaller files if performance becomes an issue
