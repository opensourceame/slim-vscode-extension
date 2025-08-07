// Test for document symbol provider
const { SlimDocumentSymbolProvider } = require('../out/src/slim.document.symbol.provider.js');
const vscode = require('vscode');

function testDocumentSymbolProvider() {
    console.log('Testing document symbol provider...\n');

    const testContent = `doctype html
html
  head
    title My Slim Page
    meta name="viewport" content="width=device-width, initial-scale=1"
    link rel="stylesheet" href="/styles.css"

  body
    header.main-header
      h1 Welcome to My Site
      nav
        a href="/" Home
        a href="/about" About
        a href="/contact" Contact

    main.content
      section.hero
        h2 Hero Section
        p This is the main hero content

        = link_to "Learn More", learn_more_path,
          class: "btn btn-primary",
          data: { turbo: false }

      section.features
        h2 Features
        .feature-grid
          .feature
            h3 Feature 1
            p Description of feature 1
          .feature
            h3 Feature 2
            p Description of feature 2
          .feature
            h3 Feature 3
            p Description of feature 3

    ruby:
      def current_user
        OpenStruct.new(
          id: 1,
          name: "John Doe",
          email: "john@example.com"
        )
      end

      def format_user_info(user)
        "#{user.name} (#{user.email})"
      end

    javascript:
      function initializePage() {
        console.log('Page initialized');

        document.addEventListener('click', function(e) {
          if (e.target.matches('.btn')) {
            console.log('Button clicked');
          }
        });
      }

      document.addEventListener('DOMContentLoaded', initializePage);

    css:
      .main-header {
        background: #f8f9fa;
        padding: 1rem;
        border-bottom: 1px solid #dee2e6;
      }

      .hero {
        text-align: center;
        padding: 3rem 1rem;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        padding: 2rem;
      }

    footer
      p &copy; 2024 My Site. All rights reserved.`;

    // Mock document
    const mockDocument = {
        getText: () => testContent,
        uri: vscode.Uri.file('/test.slim'),
        languageId: 'slim'
    };

    const provider = new SlimDocumentSymbolProvider();

    console.log('Document content:');
    console.log(testContent);
    console.log('\nExpected outline structure:');
    console.log('- doctype html');
    console.log('- html');
    console.log('  - head');
    console.log('    - title');
    console.log('    - meta');
    console.log('    - link');
    console.log('  - body');
    console.log('    - header.main-header');
    console.log('      - h1');
    console.log('      - nav');
    console.log('        - a');
    console.log('        - a');
    console.log('        - a');
    console.log('    - main.content');
    console.log('      - section.hero');
    console.log('        - h2');
    console.log('        - p');
    console.log('        - link_to (Logic)');
    console.log('      - section.features');
    console.log('        - h2');
    console.log('        - .feature-grid');
    console.log('          - .feature');
    console.log('            - h3');
    console.log('            - p');
    console.log('          - .feature');
    console.log('            - h3');
    console.log('            - p');
    console.log('          - .feature');
    console.log('            - h3');
    console.log('            - p');
    console.log('    - ruby: block');
    console.log('    - javascript: block');
    console.log('    - css: block');
    console.log('    - footer');
    console.log('      - p');

    console.log('\nTest completed. To verify:');
    console.log('1. Open a .slim file in VS Code');
    console.log('2. Open the Outline view (Ctrl+Shift+O or Cmd+Shift+O)');
    console.log('3. Verify that the outline shows the document structure');
    console.log('4. Check that different node types have appropriate icons');
    console.log('5. Verify that clicking on outline items navigates to the correct line');
}

// Run the test
testDocumentSymbolProvider();
