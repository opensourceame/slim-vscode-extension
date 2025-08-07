// Test for Ruby block detection
const { SlimTemplate } = require('../out/src/slim.template.js');

function testRubyBlockDetection() {
    console.log('Testing Ruby block detection...\n');

    const testContent = `ruby:
  def current_user
    OpenStruct.new
  end

javascript:
  function greetUser(name) {
    console.log('Hello, ' + name + '!');
    return 'Welcome to our site, ' + name;
  }

css:
  .highlight {
    background-color: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 4px;
    padding: 10px;
    margin: 10px 0;
  }`;

    const template = new SlimTemplate(testContent);
    const root = template.root;
    const lineRanges = root.getLineRanges();

    console.log('Document content:');
    console.log(testContent);
    console.log('\nParsed line ranges:');

    lineRanges.forEach((lineRange, index) => {
        console.log(`Line ${lineRange.lineNumber}: ${lineRange.node.content.trim()}`);
        console.log(`  Type: ${lineRange.node.type}`);
        console.log(`  Is Block Node: ${lineRange.node.isBlockNode()}`);
        console.log(`  Ranges: ${lineRange.ranges.length}`);
        lineRange.ranges.forEach(range => {
            console.log(`    - ${range.type}: "${range.text}" (${range.start}-${range.end})`);
        });
        console.log('');
    });

    // Check for Ruby blocks
    const rubyBlocks = lineRanges.filter(lr => lr.node.type === 'ruby');
    const rubyBlockNodes = lineRanges.filter(lr => lr.node.isBlockNode() && lr.node.type.endsWith('-block'));

    console.log('Ruby blocks found:', rubyBlocks.length);
    console.log('Ruby block nodes found:', rubyBlockNodes.length);

    // Check if semantic tokens would be skipped for block nodes
    const skippedLines = lineRanges.filter(lr => lr.node.isBlockNode());
    console.log('Lines that would be skipped by semantic token provider:', skippedLines.length);

    skippedLines.forEach(lr => {
        console.log(`  Line ${lr.lineNumber}: ${lr.node.content.trim()} (${lr.node.type})`);
    });

    console.log('\nExpected behavior:');
    console.log('- Ruby blocks should be detected as block nodes');
    console.log('- Semantic token provider should skip block nodes');
    console.log('- TextMate grammar should provide Ruby syntax highlighting');
    console.log('- All lines within the block should have Ruby syntax highlighting');
}

// Run the test
testRubyBlockDetection();
