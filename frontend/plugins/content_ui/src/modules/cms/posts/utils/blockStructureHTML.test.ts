import {
  embedBlockStructureInHTML,
  parseBlockStructureFromHTML,
} from './blockStructureHTML';

describe('CMS post block structure HTML', () => {
  it('restores empty and nested blocks from CMS HTML', () => {
    const blocks = [
      {
        id: 'parent',
        type: 'paragraph',
        props: {},
        content: [{ type: 'text', text: 'Parent', styles: {} }],
        children: [
          {
            id: 'indented',
            type: 'paragraph',
            props: {},
            content: [{ type: 'text', text: 'Indented', styles: {} }],
            children: [],
          },
        ],
      },
      {
        id: 'empty',
        type: 'paragraph',
        props: {},
        content: [],
        children: [],
      },
    ];

    const html = embedBlockStructureInHTML('<p>Parent</p><p></p>', blocks);

    expect(parseBlockStructureFromHTML(html)).toEqual(blocks);
  });

  it('allows legacy HTML to fall back to the HTML parser', () => {
    expect(
      parseBlockStructureFromHTML('<p>Legacy content</p>'),
    ).toBeUndefined();
  });
});
