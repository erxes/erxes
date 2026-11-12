import { checkBlockIsFileBlock } from '@blocknote/core';
import { useBlockNoteEditor, useEditorContentOrSelectionChange } from '@blocknote/react';
import { useState } from 'react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import type { FontSizeState } from 'erxes-ui/modules/blocks/types/toolbar/FontSize';

export const useFontSize = (): FontSizeState => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();

  const [currentSize, setCurrentSize] = useState(() => editor.getActiveStyles().fontSize || '');

  const [isFileBlock, setIsFileBlock] = useState(() =>
    checkBlockIsFileBlock(editor.getTextCursorPosition().block, editor),
  );

  useEditorContentOrSelectionChange(() => {
    setCurrentSize(editor.getActiveStyles().fontSize || '');
    setIsFileBlock(checkBlockIsFileBlock(editor.getTextCursorPosition().block, editor));
  }, editor);

  const handleSizeChange = (size: string): void => {
    if (size) {
      editor.addStyles({ fontSize: size });
    } else {
      editor.removeStyles({ fontSize: '' });
    }

    editor.focus();
  };

  return { currentSize, isFileBlock, handleSizeChange };
};
