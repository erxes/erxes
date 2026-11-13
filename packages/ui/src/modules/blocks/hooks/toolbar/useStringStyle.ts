import { useBlockNoteEditor, useEditorState } from '@blocknote/react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';

/**
 * The value of a string style (font family or size) at the cursor, and a setter.
 * Setting '' removes the style. File blocks have no text, so they report `isFileBlock`.
 */
export const useStringStyle = (style: 'fontFamily' | 'fontSize') => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();

  const { value, isFileBlock } = useEditorState({
    editor,
    selector: () => ({
      value: editor.getActiveStyles()[style] ?? '',
      isFileBlock:
        editor.schema.blockSpecs[editor.getTextCursorPosition().block.type].implementation.meta
          ?.fileBlockAccept !== undefined,
    }),
  });

  const setValue = (next: string) => {
    if (next) {
      editor.addStyles({ [style]: next });
    } else {
      editor.removeStyles({ [style]: '' });
    }

    editor.focus();
  };

  return { value, isFileBlock, setValue };
};
