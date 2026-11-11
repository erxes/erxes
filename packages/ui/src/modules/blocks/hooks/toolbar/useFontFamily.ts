import {
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import { useState } from 'react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types';
import type { FontFamilyState } from 'erxes-ui/modules/blocks/types/toolbar/FontFamily';

export const useFontFamily = (): FontFamilyState => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();
  const [currentFont, setCurrentFont] = useState(() => {
    const styles = editor.getActiveStyles();
    return styles.fontFamily || '';
  });
  const [isFileBlock, setIsFileBlock] = useState(false);

  useEditorContentOrSelectionChange(() => {
    if (!editor) return;
    try {
      const styles = editor.getActiveStyles();
      setCurrentFont(styles?.fontFamily || '');
      const block = editor.getTextCursorPosition()?.block;
      const blockSpec = block ? editor.schema.blockSpecs[block.type] : null;
      setIsFileBlock(!!blockSpec?.config?.isFileBlock);
    } catch {
      // ignore
    }
  }, editor);

  const handleFontChange = (fontValue: string) => {
    if (!editor) return;

    try {
      if (fontValue === '') {
        editor.removeStyles({ fontFamily: '' });
      } else {
        editor.addStyles({ fontFamily: fontValue });
      }
      editor.focus();
    } catch (error) {
      console.error('Error changing font:', error);
    }
  };

  return { currentFont, isFileBlock, handleFontChange };
};
