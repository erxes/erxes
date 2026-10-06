import { getMessageDraftBlocks } from '../messageDraft';

test('preserves a one-line draft and the final paragraph in a multi-line draft', () => {
  const first = { type: 'paragraph', content: [{ type: 'text', text: 'one' }] };
  const last = { type: 'paragraph', content: [{ type: 'text', text: 'two' }] };
  expect(getMessageDraftBlocks([first])).toEqual([first]);
  expect(getMessageDraftBlocks([first, last])).toEqual([first, last]);
});
test('blank editor paragraphs do not leave an enabled empty draft', () => {
  expect(
    getMessageDraftBlocks([
      { type: 'paragraph' },
      { type: 'paragraph', content: [{ type: 'text', text: ' ' }] },
      { type: 'paragraph', content: [] },
    ]),
  ).toEqual([]);
});
test('removes only the empty trailing paragraph without mutating the editor', () => {
  const blocks = [
    { type: 'paragraph', content: ['text'] },
    { type: 'paragraph', content: [] },
  ];
  expect(getMessageDraftBlocks(blocks)).toEqual([blocks[0]]);
  expect(blocks).toHaveLength(2);
  expect(getMessageDraftBlocks([{ type: 'image', content: [] }])).toHaveLength(
    1,
  );
  expect(
    getMessageDraftBlocks([{ type: 'paragraph', content: [], children: [{}] }]),
  ).toHaveLength(1);
});
