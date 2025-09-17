# Slim Linter Error Examples

This document provides comprehensive examples of the syntax errors and warnings that the Slim VS Code extension will detect.

## 🔴 Syntax Errors (Red Underlines)

### 1. Invalid Tag Syntax

**Error**: Tag names cannot start with numbers
```slim
123invalid This will show an error
```
**Message**: `Invalid tag name: '123invalid'. Tag names must start with a letter and contain only letters and numbers.`

**Error**: Invalid characters at line start
```slim
@invalid-start This is not valid Slim syntax
$also-invalid Another invalid start
```
**Message**: `Invalid syntax. Lines must start with a tag name, #id, .class, [attributes], -, =, or /.`

### 2. Unclosed Brackets

**Error**: Missing closing square bracket
```slim
div[class="test" Missing closing bracket
```
**Message**: `Unclosed square brackets in attributes.`

**Error**: Missing closing parenthesis
```slim
= some_method(param1, param2 Missing closing paren
```
**Message**: `Unclosed parentheses.`

**Error**: Missing closing curly brace
```slim
= { key: "value" Missing closing brace
```
**Message**: `Unclosed curly braces.`

### 3. Invalid Attribute Syntax

**Error**: Empty attribute name
```slim
div[="no-name"] Attribute name is missing
```
**Message**: `Attribute name cannot be empty.`

**Error**: Invalid attribute name starting with number
```slim
div[123attr="invalid"] Attribute names cannot start with numbers
```
**Message**: `Invalid attribute name: '123attr'. Attribute names must start with a letter.`

**Error**: Empty attribute brackets
```slim
div[] Empty brackets are not allowed
```
**Message**: `Empty attribute brackets are not allowed.`

### 4. Ruby Syntax Errors

**Error**: Unmatched quotes
```slim
= "This string is not closed properly
- name = 'Another unclosed string
```
**Message**: `Unmatched double quote in Ruby code.` or `Unmatched single quote in Ruby code.`

**Error**: Unexpected 'end' keyword
```slim
- end
```
**Message**: `Unexpected 'end' keyword without matching block opener.`

## ⚠️ Warnings (Yellow Underlines)

### 1. Inconsistent Indentation

**Warning**: Mixed spaces and tabs
```slim
div
  p Normal 2-space indentation
	    span This line uses a tab instead of spaces
```
**Message**: `Inconsistent indentation: expected spaces but found tabs.`

**Warning**: Wrong indentation size
```slim
div
   p This has 3 spaces instead of 2 (assuming 2-space config)
```
**Message**: `Inconsistent indentation: expected multiples of 2 spaces.`

### 2. Duplicate IDs

**Warning**: Same ID used multiple times
```slim
div#duplicate-id First element with this ID
span#duplicate-id Second element with same ID
```
**Message**: `Duplicate ID 'duplicate-id'. IDs must be unique within the document.`

### 3. Empty Tags (Optional Warning)

**Warning**: Tags with only selectors but no content
```slim
.empty-class-only
#empty-id-only
```
**Message**: `Empty tag with only selectors. Consider adding content or removing the line.`

## 🚫 Non-Slim Blocks (Ignored by Linter)

The linter automatically skips validation for non-Slim content blocks. These blocks can contain any syntax without triggering Slim linting errors:

### JavaScript Blocks
```slim
javascript:
  console.log("JavaScript code");
  // Even invalid Slim syntax here is ignored:
  123invalid = "this looks like invalid Slim but it's JavaScript"
  [unclosed-bracket = "this is fine in JavaScript context"
```

### CSS/SCSS Blocks
```slim
css:
  .valid-css {
    color: red;
  }
  /* CSS with Slim-looking syntax is ignored: */
  .123starts-with-number { color: blue; }

scss:
  $primary-color: #333;
  .nested {
    &:hover { color: lighten($primary-color, 20%); }
  }
  // Invalid Slim syntax in SCSS is ignored:
  123invalid { color: red; }
```

### Ruby Blocks
```slim
ruby:
  def some_method
    puts "This is Ruby code"
  end
  # Ruby code that looks like invalid Slim is ignored:
  123variable = "starts with number but it's Ruby"
  [some_array] = ["this", "looks", "like", "slim", "attributes"]
```

### Comment Blocks
```slim
/
  This is a comment block
  123invalid syntax here is ignored
  [unclosed brackets are ignored
  Even @invalid characters are fine in comments
```

## ✅ Valid Examples (No Errors)

These examples show correct Slim syntax that won't trigger any linting errors:

```slim
doctype html
html
  head
    title My Page

  body.main-content
    h1#page-title Welcome

    div.container[data-role="main"]
      p.description This is valid content

      - if user_signed_in?
        p = "Hello, #{current_user.name}!"
        = link_to "Profile", user_path(current_user), class: "btn"
      - else
        p Please sign in

    ul.nav-list
      - menu_items.each do |item|
        li.nav-item[data-id=item.id]
          = link_to item.name, item.path

    javascript:
      console.log("Valid JavaScript block");

    css:
      .valid-styles {
        color: blue;
      }
```

## ⚙️ Configuration

You can customize which linting rules are active through VS Code settings:

- **`slim.linting.enabled`**: Enable/disable all linting (default: true)
- **`slim.linting.validateSyntax`**: Check basic Slim syntax (default: true)
- **`slim.linting.validateIndentation`**: Check indentation consistency (default: true)
- **`slim.linting.validateRuby`**: Validate embedded Ruby code (default: true)
- **`slim.linting.validateIds`**: Check for duplicate IDs (default: true)
- **`slim.linting.warnEmptyTags`**: Warn about empty tags (default: false)

## 📝 How to Use

1. Open any `.slim` file in VS Code
2. The linter runs automatically as you type
3. Errors appear as red squiggly underlines
4. Warnings appear as yellow squiggly underlines
5. Hover over the underlines to see detailed error messages
6. Check the "Problems" panel (View → Problems) to see all issues at once

The linting helps catch common mistakes early and ensures your Slim templates follow proper syntax conventions!
