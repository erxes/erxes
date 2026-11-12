import { checkBlockIsFileBlock } from '@blocknote/core';
import { useBlockNoteEditor, useEditorContentOrSelectionChange } from '@blocknote/react';
import { useState } from 'react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import type { FontFamilyState } from 'erxes-ui/modules/blocks/types/toolbar/FontFamily';

export const useFontFamily = (): FontFamilyState => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();

  const [currentFont, setCurrentFont] = useState(() => editor.getActiveStyles().fontFamily || '');

  const [isFileBlock, setIsFileBlock] = useState(false);

  useEditorContentOrSelectionChange(() => {
    setCurrentFont(editor.getActiveStyles().fontFamily || '');
    setIsFileBlock(checkBlockIsFileBlock(editor.getTextCursorPosition().block, editor));
  }, editor);

  const handleFontChange = (fontValue: string) => {
    if (fontValue === '') {
      editor.removeStyles({ fontFamily: '' });
    } else {
      editor.addStyles({ fontFamily: fontValue });
    }

    editor.focus();
  };

  return { currentFont, isFileBlock, handleFontChange };
};
