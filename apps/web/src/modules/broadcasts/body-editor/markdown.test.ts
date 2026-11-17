// @vitest-environment happy-dom
import { BlockNoteEditor } from '@blocknote/core';
import { describe, expect, it } from 'vite-plus/test';
import { blocksToMarkdown, markdownToBlocks } from './markdown';
import { BODY_SCHEMA, type BodyEditor } from './schema';

const editorWith = (markdown: string): BodyEditor =>
  BlockNoteEditor.create({ schema: BODY_SCHEMA, initialContent: markdownToBlocks(markdown) });

describe('broadcast body Markdown', () => {
  it('shows known fields as chips and keeps unknown ones as text', () => {
    const editor = editorWith('Hi {{ firstName | there }}, from {{ organization }} {{ points }}');

    expect(editor.document[0]?.content).toEqual([
      { type: 'text', text: 'Hi ', styles: {} },
      { type: 'field', props: { name: 'firstName', fallback: 'there' } },
      { type: 'text', text: ', from ', styles: {} },
      { type: 'field', props: { name: 'organization', fallback: '' } },
      { type: 'text', text: ' {{ points }}', styles: {} },
    ]);
  });

  it('keeps inline code as written and a fallback with quotes', () => {
    const markdown = 'Use `{{ email }}` · {{ firstName | "friend" & co }}';

    expect(blocksToMarkdown(editorWith(markdown))).toBe(markdown);
  });

  it('saves a chip fallback without its spaces, and one of only spaces as none', () => {
    const editor: BodyEditor = BlockNoteEditor.create({
      schema: BODY_SCHEMA,
      initialContent: [
        {
          type: 'paragraph',
          content: [
            { type: 'field', props: { name: 'firstName', fallback: '  there ' } },
            { type: 'text', text: ' and ', styles: {} },
            { type: 'field', props: { name: 'organization', fallback: '   ' } },
          ],
        },
      ],
    });

    expect(blocksToMarkdown(editor)).toBe('{{ firstName | there }} and {{ organization }}');
  });

  it('saves the Markdown core renders, fields as placeholders', () => {
    const markdown = [
      '# News for {{ firstName | you }}',
      '',
      'Hi {{ firstName }}, see **[our sale](https://example.com/sale)** *today*.',
      '',
      '* 20% off shoes',
      '* Free delivery',
    ].join('\n');

    expect(blocksToMarkdown(editorWith(markdown))).toBe(markdown);
  });
});
