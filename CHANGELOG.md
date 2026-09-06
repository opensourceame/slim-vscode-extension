# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
