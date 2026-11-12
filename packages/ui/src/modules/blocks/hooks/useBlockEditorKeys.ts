import type { KeyboardEvent, MouseEvent } from 'react';
import { useRef } from 'react';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import { isCodeFormattingShortcut } from 'erxes-ui/modules/blocks/utils/toolbar/isCodeFormattingShortcut';
import { isEmptyBlock } from 'erxes-ui/modules/blocks/utils/isEmptyBlock';

// Toolbar clicks must preserve the editor selection for formatting.
export const keepSelectionOnToolbarClick = (event: MouseEvent<HTMLDivElement>) => {
  if (
    event.button === 0 &&
    event.target instanceof Element &&
    event.target.closest('.bn-formatting-toolbar button:not(:disabled)')
  ) {
    event.preventDefault();
  }
};

/**
 * Keyboard handling around the editor: code-formatting shortcuts are blocked inside code,
 * deleting an empty first block moves the cursor to the next one, and text typed after a
 * delete starts without the deleted text's marks.
 */
export const useBlockEditorKeys = (editor: IBlockEditor, editable: boolean) => {
  const deletingText = useRef(false);

  const onKeyDownCapture = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!editable || !(e.target instanceof Node) || !editor.domElement?.contains(e.target)) {
      return;
    }

    if (editor.getActiveStyles().code && isCodeFormattingShortcut(e)) {
      e.preventDefault();
      e.stopPropagation();

      return;
    }

    if (e.key !== 'Backspace' && e.key !== 'Delete') {
      return;
    }

    deletingText.current = true;

    const { block, prevBlock, nextBlock, parentBlock } = editor.getTextCursorPosition();

    if (parentBlock || !nextBlock || !isEmptyBlock(block)) {
      return;
    }

    if (e.key === 'Backspace' && prevBlock) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    editor.removeBlocks([block]);
    editor.setTextCursorPosition(nextBlock, 'start');
  };

  const onKeyUpCapture = () => {
    deletingText.current = false;
  };

  const clearMarksAfterDelete = () => {
    if (!deletingText.current) return;

    deletingText.current = false;

    if (isEmptyBlock(editor.getTextCursorPosition().block)) {
      editor.transact((tr) => tr.setStoredMarks([]));
    }
  };

  return { onKeyDownCapture, onKeyUpCapture, clearMarksAfterDelete };
};
