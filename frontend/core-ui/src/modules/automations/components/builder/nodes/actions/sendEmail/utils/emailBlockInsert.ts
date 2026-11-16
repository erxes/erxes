import type { Editor as TiptapEditor } from '@tiptap/core';

/** Inserts content at a dropped position, or at the cursor without one. */
export const emailBlockInsert = (
  editor: TiptapEditor,
  content: Parameters<TiptapEditor['commands']['insertContent']>[0],
  position?: number,
) => {
  const chain = editor.chain().focus();

  (position === undefined
    ? chain.insertContent(content)
    : chain.insertContentAt(position, content)
  ).run();
};
