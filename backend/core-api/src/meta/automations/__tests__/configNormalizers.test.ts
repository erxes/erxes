import { normalizeSendEmailConfig } from '../configNormalizers';

const paragraph = (content: unknown[]) => ({
  type: 'paragraph',
  content,
  children: [],
});

describe('normalizeSendEmailConfig', () => {
  it('turns block text variables into the chips the block editor shows', () => {
    const normalized = normalizeSendEmailConfig({
      contentFormat: 'blocks',
      content: JSON.stringify([
        paragraph([
          {
            type: 'text',
            text: 'Message: {{ content }}!',
            styles: { bold: true },
          },
        ]),
      ]),
    });

    expect(
      JSON.parse((normalized as { content: string }).content)[0].content,
    ).toEqual([
      { type: 'text', text: 'Message: ', styles: { bold: true } },
      {
        type: 'attribute',
        props: { name: 'content', value: 'content', width: 150, height: 50 },
      },
      { type: 'text', text: '!', styles: { bold: true } },
    ]);
  });

  it('turns email editor text variables into its variable nodes, code aside', () => {
    expect(
      normalizeSendEmailConfig({
        contentFormat: 'maily',
        contentJson: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '{{ actions.a1.text }}' }],
            },
            {
              type: 'codeBlock',
              content: [{ type: 'text', text: '{{ raw }}' }],
            },
          ],
        },
      }),
    ).toEqual({
      contentFormat: 'maily',
      contentJson: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'variable',
                attrs: {
                  id: '{{ actions.a1.text }}',
                  fallback: null,
                  required: false,
                },
              },
            ],
          },
          { type: 'codeBlock', content: [{ type: 'text', text: '{{ raw }}' }] },
        ],
      },
    });
  });

  it('leaves a body the builder wrote, or one it cannot read, as it is', () => {
    const written = {
      contentFormat: 'blocks',
      content: JSON.stringify([
        paragraph([{ type: 'attribute', props: { name: 'x', value: 'x' } }]),
      ]),
    };

    expect(normalizeSendEmailConfig(written)).toEqual(written);
    expect(
      normalizeSendEmailConfig({
        contentFormat: 'blocks',
        content: '<p>Hi</p>',
      }),
    ).toEqual({ contentFormat: 'blocks', content: '<p>Hi</p>' });
  });
});
