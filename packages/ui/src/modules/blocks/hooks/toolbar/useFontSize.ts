import {
  useBlockNoteEditor,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import { useState } from 'react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types';
import type { FontSizeState } from 'erxes-ui/modules/blocks/types/toolbar/FontSize';

export const useFontSize = (): FontSizeState => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();
  const [currentSize, setCurrentSize] = useState(
    () => editor.getActiveStyles().fontSize || '',
  );
  const [isFileBlock, setIsFileBlock] = useState(() => {
    const { block } = editor.getTextCursorPosition();
    return !!editor.schema.blockSpecs[block.type].config.isFileBlock;
  });

  useEditorContentOrSelectionChange(() => {
    setCurrentSize(editor.getActiveStyles().fontSize || '');
    const { block } = editor.getTextCursorPosition();
    setIsFileBlock(!!editor.schema.blockSpecs[block.type].config.isFileBlock);
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
