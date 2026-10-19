/** @jest-environment node */
import type { UIMessageChunk } from 'ai';
import { observePageFocus } from '../focus/pageFocusStream';
import { readPageFocus } from '../focus/pageFocusContract';
const focus = {
  kind: 'page-focus',
  version: 1,
  snapshotId: '76f0586e-d3be-4d52-b175-2328319a2454',
  targetId: 'element-1',
  path: '/contacts',
  title: 'Add customer',
  description: 'Use this button.',
};
const streamOf = (chunks: UIMessageChunk[]) =>
  new ReadableStream<UIMessageChunk>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
const drain = async (stream: ReadableStream<UIMessageChunk>) => {
  const reader = stream.getReader();
  const result: UIMessageChunk[] = [];
  while (true) {
    const next = await reader.read();
    if (next.done) return result;
    result.push(next.value);
  }
};
it('delivers only validated results from the matching tool and preserves SDK chunks', async () => {
  const chunks: UIMessageChunk[] = [
    {
      type: 'tool-input-available',
      toolName: 'callGraphql',
      toolCallId: 'other',
      input: {},
    },
    { type: 'tool-output-available', toolCallId: 'other', output: focus },
    {
      type: 'tool-input-available',
      toolName: 'focusPageElement',
      toolCallId: 'focus',
      input: {},
    },
    { type: 'tool-output-available', toolCallId: 'focus', output: focus },
    { type: 'tool-output-available', toolCallId: 'focus', output: focus },
  ];
  const onFocus = jest.fn();
  expect(await drain(observePageFocus(streamOf(chunks), onFocus))).toEqual(
    chunks,
  );
  expect(onFocus.mock.calls).toEqual([['focus', focus]]);
});
it('does nothing for output-only replay chunks or malformed references', async () => {
  const onFocus = jest.fn();
  await drain(
    observePageFocus(
      streamOf([
        { type: 'tool-output-available', toolCallId: 'history', output: focus },
      ]),
      onFocus,
    ),
  );
  expect(onFocus).not.toHaveBeenCalled();
  expect(readPageFocus({ ...focus, targetId: 'body' })).toBeUndefined();
  expect(
    readPageFocus({ ...focus, path: 'https://evil.example' }),
  ).toBeUndefined();
});
