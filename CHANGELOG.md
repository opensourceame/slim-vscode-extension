# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.9] - 2026-10-14

### Fixed
- The linter no longer reports "Invalid syntax" on valid Slim: lines starting with `'` (text with trailing whitespace), `<` (inline HTML) and `*` (splat attributes / dynamic tags) are now accepted (#55)
- The contents of all Slim embedded engines are now treated as non-Slim blocks, so the linter skips them, the formatter preserves their indentation and the outline lists them under Blocks. Previously only `javascript:`, `css:`, `scss:` and `ruby:` were recognised, and the contents of `markdown:`, `sass:`, `less:`, `coffee:`, `erb:`, `textile:`, `rdoc:` and `asciidoc:` blocks were linted and reformatted as Slim markup. Engine lines with attributes, such as `javascript defer=true:`, are recognised too (#55)

## [0.4.8] - 2026-10-13

### Removed
- The "Slim: Test Formatter", "Slim: Check Available Formatters", "Slim: Force Format Document" and "Slim: Debug Workspace" commands, which were listed in the Command Palette but never registered, so running them failed with "command not found". Use VS Code's built-in Format Document and Format Document With... instead (#54)

## [0.4.7] - 2026-10-13

### Fixed
- Format Document now honours `slim.useTab` and indents with tabs when it's on; previously the formatter read the wrong setting name and always used spaces, leaving the linter's "expected tabs" warnings unfixable (#52)

## [0.4.6] - 2026-10-12

### Fixed
- The `slim.formatOnSave` setting now formats Slim files on save; previously it had no effect. Like VS Code's `editor.formatOnSave`, it doesn't run on auto save after a delay, and it steps aside when `editor.formatOnSave` is already on (#51)

## [0.4.5] - 2026-10-12

### Security
- Upgrade @vscode/vsce to 4.0.0, which removes undici, markdown-it and the secretlint/globby/fast-glob/micromatch/braces chain from the dependency tree:
  - undici: fixes TLS certificate validation bypass, response splitting, cookie disclosure, unsafe-method cache replay and multiple DoS issues (GHSA-w293-vg96-wgc3, GHSA-r53p-7pc4-xj5r, GHSA-2jfj-6hjv-fm6j, GHSA-8436-99hf-9mmv, GHSA-2gqq-gqf2-x968, GHSA-pmjh-fq2x-6v4x and others)
  - markdown-it: fixes quadratic-time DoS with `linkify: true` (GHSA-253c-mchw-3w2r)
  - braces: fixes stack-exhaustion DoS via deeply nested patterns (GHSA-vfj7-8cjw-p6xm)
- Bump js-yaml (via mocha) to 5.4.3 (fixes CPU DoS via empty merge sources, GHSA-r3ph-w7gj-g6xm)
- `npm audit` now reports 0 vulnerabilities

### Changed
- Packaging the extension (`npm run package` / `npm run publish`) now requires Node.js 22 or newer

## [0.4.4] - 2026-09-23

### Security
- Bump js-yaml to 4.3.2 (fixes quadratic CPU consumption DoS in `!!omap`/merge-key resolution, GHSA-5p4m-2wfm-xmqj and GHSA-2883-xcg3-v3hh)
- Bump fast-uri to 3.1.8 (fixes multiple host-confusion/SSRF issues via malformed URI normalization, GHSA-7p8r-x3mc-p8w7, GHSA-5jgf-p345-68v8, GHSA-f65p-4m7j-42xc, GHSA-fph4-wmhf-6fwf, GHSA-jqff-g426-hqxp)
- Bump brace-expansion to 5.0.12 (fixes DoS via unbounded intermediate arrays, GHSA-rgw5-rvv9-x895)
- Bump qs to 6.16.0 (fixes array-limit bypass and DoS via attacker-controlled `isBuffer`, GHSA-x5fp-wj9c-mxmx)
- `npm audit` now reports 0 vulnerabilities

## [0.4.3] - 2026-09-06

### Fixed
- Syntax highlighting no longer breaks on lines that begin with an implicit `div` (e.g. `.example` or `#id-2` with no explicit tag name) — these now highlight the same as `div.example`/`div#id-2` (#33)

## [0.4.2] - 2026-07-29

### Security
- Upgrade @vscode/vsce to 3.9.2 and mocha to 12.0.0-rc.5 to eliminate all remaining vulnerable dependency chains (brace-expansion, diff, linkify-it, markdown-it, serialize-javascript, glob, minimatch)
- Remove unused ts-mocha dev dependency
- `npm audit` now reports 0 vulnerabilities

## [0.4.1] - 2026-07-28

### Security
- Bump undici from 7.13.0 to 7.24.1 (fixes multiple CVEs including request smuggling and WebSocket DoS)
- Bump minimatch from 3.1.2/9.0.5 to 3.1.5/9.0.9
- Bump qs from 6.14.0 to 6.14.2

## [0.4.0] - 2025-12-20

### Added
- Outline now includes CSS symbols

## [0.3.5] - 2025-12-19

### Security
- Security update to address vulnerability dependencies

## [0.3.4] - 2025-10-07

- Security update

## [0.3.3] - 2025-09-18

- Fix for parenthesis close detection when parenthesis content spans multiple lines

## [0.3.2] - 2025-09-17

- Added support for pipe (|) syntax for text content in linter validation
- Fixed duplicate ID error when IDs appear in attribute values (e.g., target: '#test')

## [0.3.1] - 2025-09-17

- bugfix, "render" in a slim template was being incorrectly flagged as an error

## [0.3.0] - 2025-09-17

### Added
- **Syntax Linting**: Real-time error detection and warnings for Slim templates
  - Invalid tag syntax validation
  - Unclosed brackets detection
  - Invalid attribute syntax checking
  - Inconsistent indentation warnings
  - Duplicate ID detection
  - Basic Ruby syntax validation for embedded code
- **Linting Configuration**: Comprehensive settings to enable/disable specific linting rules
  - `slim.linting.enabled`: Master toggle for all linting features
  - `slim.linting.validateSyntax`: Basic Slim syntax validation
  - `slim.linting.validateIndentation`: Indentation consistency checking
  - `slim.linting.validateRuby`: Ruby code syntax validation
  - `slim.linting.validateIds`: Duplicate ID detection
  - `slim.linting.warnEmptyTags`: Empty tag warnings

## [0.2.3] - 2025-09-17

- README fix

## [0.2.3] - 2025-08-14

- minor fixes

## [0.2.3] - 2025-08-13

- more syntax highlighting improvements, especially in embedded languages
- updated screenshots and docs

## [0.2.2] - 2025-08-08

- improved syntax highlighting

## [0.2.1] - 2025-08-07

### Improved

- show major tags in the outline (such as form, section, article, etc.)

## [0.2.0] - 2025-08-07

### Added
- add a basic outline (list of elements with IDs, non-Slim blocks)

## [0.1.1] - 2025-08-07

- Corrected an issue with code folding and set the default folding depth to 2 lines
- Rendering with tabs works properly
- Preserve original indentation on non-Slim blocks (Javascript, CSS etc.)

## [0.1.0] - 2025-08-06

### Added

- support javascript and css/scss blocks

## [0.0.7] - 2025-08-06

### Added

- highlight interpolated text ("hello #{user.name}" in Slim or "hello {{user.name}} in Trim")

## [0.0.6] - 2025-08-05

### Improved

- improve syntax highlighting to cover multi-line comments

## [0.0.5] - 2025-08-04

### Added

- Added intelligent code folding based on content structure
- Automatic folding ranges for blocks
- Configurable folding threshold via settings
- Nested folding support for complex templates

## [0.0.4] - 2025-08-03

### Added

- Configurable formatting options
- Support for both .slim and .trim file extensions

## [0.0.3] - 2025-08-02

### Added

- Document and range formatting
- Auto-indentation support

## [0.0.2] - 2025-08-01

### Added

- Syntax highlighting for Slim and Trim templates

## [0.0.1] - 2025-07-30

### Added

- Initial alpha release
