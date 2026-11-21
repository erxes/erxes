import { toNoteContent } from '../useTransactionsDecide';

jest.mock('erxes-ui', () => ({ toast: jest.fn() }));

describe('toNoteContent', () => {
  // erxes-ui `parseBlocks` renders a note as blocks only when every block has
  // an `id` and a `type`; otherwise the note shows as raw JSON.
  it('writes the decline reason as blocks the internal note display renders', () => {
    const blocks = JSON.parse(toNoteContent('sa'));

    expect(blocks).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        type: 'paragraph',
        content: [{ type: 'text', text: 'sa', styles: {} }],
      }),
    ]);
  });
});
