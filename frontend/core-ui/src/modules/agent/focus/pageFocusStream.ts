import type { UIMessageChunk } from 'ai';
import { readPageFocus, type IPageFocus } from './pageFocusContract';

/** Observe typed results on live sends only; preserve every original SDK chunk. */
export const observePageFocus = (
  stream: ReadableStream<UIMessageChunk>,
  onFocus?: (toolCallId: string, focus: IPageFocus) => void,
): ReadableStream<UIMessageChunk> => {
  if (!onFocus) return stream;
  const calls = new Set<string>();
  return stream.pipeThrough(
    new TransformStream<UIMessageChunk, UIMessageChunk>({
      transform(chunk, controller) {
        if (
          chunk.type === 'tool-input-available' &&
          chunk.toolName === 'focusPageElement'
        )
          calls.add(chunk.toolCallId);
        if (
          chunk.type === 'tool-output-available' &&
          calls.has(chunk.toolCallId)
        ) {
          const focus = readPageFocus(chunk.output);
          if (focus) onFocus(chunk.toolCallId, focus);
          calls.delete(chunk.toolCallId);
        }
        controller.enqueue(chunk);
      },
    }),
  );
};
