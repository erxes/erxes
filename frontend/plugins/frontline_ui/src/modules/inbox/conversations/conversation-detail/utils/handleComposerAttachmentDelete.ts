import { TextSelection } from '@tiptap/pm/state';

import type { ComposerBlockEditor } from '../types/composer';
import { PREVIEW_BLOCK_TYPES } from '../constants/composer';

export const handleComposerAttachmentDelete = (
  editor: ComposerBlockEditor,
  event: KeyboardEvent,
): boolean => {
  if (event.key !== 'Backspace' && event.key !== 'Delete') return false;

  const { doc, selection } = editor.prosemirrorState;
  if (!selection.empty) {
    let includesAttachment = false;
    const textRanges: { from: number; to: number }[] = [];
    doc.nodesBetween(selection.from, selection.to, (node, position) => {
      if (PREVIEW_BLOCK_TYPES.has(node.type.name)) {
        includesAttachment = true;
        return false;
      }
      if (node.isTextblock) {
        const from = Math.max(selection.from, position + 1);
        const to = Math.min(selection.to, position + 1 + node.content.size);
        if (from < to) textRanges.push({ from, to });
        return false;
      }
      return true;
    });
    if (!includesAttachment) return false;

    event.preventDefault();
    event.stopPropagation();
    // Clear selected text without removing the hidden attachment blocks.
    editor.transact((transaction) => {
      for (const { from, to } of textRanges.reverse()) {
        transaction.delete(from, to);
      }
      const cursor = transaction.doc.resolve(
        transaction.mapping.map(selection.from),
      );
      const textSelection =
        TextSelection.findFrom(cursor, 1, true) ||
        TextSelection.findFrom(cursor, -1, true);
      if (textSelection) transaction.setSelection(textSelection);
    });
    return true;
  }

  const { block, prevBlock, nextBlock } = editor.getTextCursorPosition();
  const { $from } = selection;
  const atAttachmentBoundary =
    event.key === 'Backspace'
      ? $from.parentOffset === 0 &&
        PREVIEW_BLOCK_TYPES.has(prevBlock?.type ?? '')
      : $from.parentOffset === $from.parent.content.size &&
        PREVIEW_BLOCK_TYPES.has(nextBlock?.type ?? '');

  if (!PREVIEW_BLOCK_TYPES.has(block.type) && !atAttachmentBoundary)
    return false;

  event.preventDefault();
  event.stopPropagation();
  return true;
};
