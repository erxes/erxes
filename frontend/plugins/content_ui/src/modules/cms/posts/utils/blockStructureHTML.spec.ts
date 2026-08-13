import {
  embedBlockStructureInHTML,
  parseBlockStructureFromHTML,
} from './blockStructureHTML';

const validBlock = {
  id: 'block-1',
  type: 'paragraph',
  props: {},
  content: [{ type: 'text', text: 'Fallback content', styles: {} }],
  children: [],
};

const parseEmbeddedBlocks = (blocks: unknown[]) =>
  parseBlockStructureFromHTML(
    embedBlockStructureInHTML('<p>Fallback content</p>', blocks),
  );

describe('CMS post block structure validation', () => {
  it('accepts valid supported block metadata', () => {
    expect(parseEmbeddedBlocks([validBlock])).toEqual([validBlock]);
  });

  it.each([undefined, null, 42, '', '   '])(
    'rejects an invalid block id: %p',
    (id) => {
      expect(parseEmbeddedBlocks([{ ...validBlock, id }])).toBeUndefined();
    },
  );

  it.each([undefined, null, 42, 'unknownBlock'])(
    'rejects an invalid or unsupported block type: %p',
    (type) => {
      expect(parseEmbeddedBlocks([{ ...validBlock, type }])).toBeUndefined();
    },
  );

  it.each([null, 'child', {}])(
    'rejects non-array children metadata: %p',
    (children) => {
      expect(
        parseEmbeddedBlocks([{ ...validBlock, children }]),
      ).toBeUndefined();
    },
  );

  it('recursively rejects malformed child blocks', () => {
    expect(
      parseEmbeddedBlocks([
        {
          ...validBlock,
          children: [{ ...validBlock, id: '' }],
        },
      ]),
    ).toBeUndefined();
  });
});
