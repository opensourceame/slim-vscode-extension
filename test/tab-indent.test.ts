import * as assert from 'assert';
import { SlimTemplate } from '../src/slim.template';

describe('Tab Indentation Tests', () => {
    it('should indent selected lines by 2 spaces', () => {
        // Mock document and selections
        const mockDocument = {
            getText: () => 'div\n  p\nspan',
            lineAt: (lineNum: number) => ({
                text: lineNum === 0 ? 'div' : lineNum === 1 ? '  p' : 'span'
            })
        } as any;

        const mockSelections = [
            {
                start: { line: 0, character: 0 },
                end: { line: 2, character: 4 }
            }
        ] as any;

        const edits = SlimTemplate.indentSelections(mockDocument, mockSelections);

        assert.strictEqual(edits.length, 3);
        assert.strictEqual(edits[0].newText, '  div');
        assert.strictEqual(edits[1].newText, '    p');
        assert.strictEqual(edits[2].newText, '  span');
    });

    it('should handle empty selections', () => {
        const mockDocument = {
            getText: () => 'div\np',
            lineAt: (lineNum: number) => ({
                text: lineNum === 0 ? 'div' : 'p'
            })
        } as any;

        const mockSelections: any[] = [];

        const edits = SlimTemplate.indentSelections(mockDocument, mockSelections);

        assert.strictEqual(edits.length, 0);
    });
});