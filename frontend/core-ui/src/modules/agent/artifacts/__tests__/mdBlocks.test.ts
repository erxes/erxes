import { parseInline, parseMarkdownBlocks } from '../converters/mdBlocks';

describe('parseInline', () => {
  it('decomposes bold, italic, code, and links', () => {
    const inlines = parseInline('a **bold** and *it* and `code` and [x](http://y)');
    expect(inlines).toEqual([
      { text: 'a ' },
      { text: 'bold', bold: true },
      { text: ' and ' },
      { text: 'it', italic: true },
      { text: ' and ' },
      { text: 'code', code: true },
      { text: ' and ' },
      { text: 'x', href: 'http://y' },
    ]);
  });

  it('supports underscore bold and italic', () => {
    expect(parseInline('__b__ _i_')).toEqual([
      { text: 'b', bold: true },
      { text: ' ' },
      { text: 'i', italic: true },
    ]);
  });

  it('returns plain text when nothing matches', () => {
    expect(parseInline('plain text')).toEqual([{ text: 'plain text' }]);
  });
});

describe('parseMarkdownBlocks', () => {
  it('parses headings with levels', () => {
    const blocks = parseMarkdownBlocks('# Title\n### Sub');
    expect(blocks).toEqual([
      { type: 'heading', level: 1, inlines: [{ text: 'Title' }] },
      { type: 'heading', level: 3, inlines: [{ text: 'Sub' }] },
    ]);
  });

  it('joins consecutive paragraph lines and stops at blank lines', () => {
    const blocks = parseMarkdownBlocks('one\ntwo\n\nthree');
    expect(blocks).toEqual([
      { type: 'paragraph', inlines: [{ text: 'one two' }] },
      { type: 'paragraph', inlines: [{ text: 'three' }] },
    ]);
  });

  it('parses unordered and ordered lists with continuations', () => {
    const unordered = parseMarkdownBlocks('- a\n- b\n  continued');
    expect(unordered).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [[{ text: 'a' }], [{ text: 'b continued' }]],
      },
    ]);

    const ordered = parseMarkdownBlocks('1. first\n2. second');
    expect(ordered).toEqual([
      {
        type: 'list',
        ordered: true,
        items: [[{ text: 'first' }], [{ text: 'second' }]],
      },
    ]);
  });

  it('parses blockquotes', () => {
    const blocks = parseMarkdownBlocks('> said\n> more');
    expect(blocks).toEqual([
      { type: 'quote', inlines: [{ text: 'said more' }] },
    ]);
  });

  it('parses pipe tables with outer pipes', () => {
    const blocks = parseMarkdownBlocks(
      '| Name | Qty |\n| --- | ---: |\n| Widget | 4 |',
    );
    expect(blocks).toEqual([
      {
        type: 'table',
        header: ['Name', 'Qty'],
        rows: [['Widget', '4']],
      },
    ]);
  });

  it('parses fenced code and thematic breaks', () => {
    const blocks = parseMarkdownBlocks('```\nkeep |\n```\n\n---');
    expect(blocks).toEqual([
      { type: 'code', text: 'keep |' },
      { type: 'hr' },
    ]);
  });

  it('parses indented code blocks', () => {
    const blocks = parseMarkdownBlocks('para\n\n    indented\n    lines');
    expect(blocks).toEqual([
      { type: 'paragraph', inlines: [{ text: 'para' }] },
      { type: 'code', text: 'indented\nlines' },
    ]);
  });

  it('keeps bold inside list items', () => {
    const blocks = parseMarkdownBlocks('- **total**: 12');
    expect(blocks).toEqual([
      {
        type: 'list',
        ordered: false,
        items: [[{ text: 'total', bold: true }, { text: ': 12' }]],
      },
    ]);
  });
});
