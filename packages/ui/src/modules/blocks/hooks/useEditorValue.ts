import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import { parseBlocks } from 'erxes-ui/modules/blocks/utils/parseBlocks';

type EditorBlocks = Parameters<IBlockEditor['replaceBlocks']>[1];

/**
 * Keeps an editor and a stored value in sync. The value is block JSON, or HTML when
 * `isHTML` is set; either kind is read back, so content saved in the other format still loads.
 * Edits reach `onChange` debounced by 300 ms; the editor's own output is never loaded back.
 */
export const useEditorValue = ({
  editor,
  initialContent,
  isHTML,
  onChange,
}: {
  editor: IBlockEditor;
  initialContent: string | undefined;
  isHTML: boolean;
  onChange: (value: string) => void;
}) => {
  const skipNextOnChangeRef = useRef(false);
  const lastEditorOutputRef = useRef('');

  useEffect(() => {
    if (!initialContent?.trim() || initialContent === lastEditorOutputRef.current) return;

    const load = (blocks: EditorBlocks) => {
      if (JSON.stringify(editor.document) === JSON.stringify(blocks)) return;

      skipNextOnChangeRef.current = true;
      editor.replaceBlocks(editor.document, blocks);
    };

    const parsed = parseBlocks(initialContent);

    if (parsed) {
      load(parsed);

      return;
    }

    try {
      load(editor.tryParseHTMLToBlocks(initialContent));
    } catch {
      // Legacy or plain-text content that doesn't parse keeps the editor as it is.
    }
  }, [editor, initialContent]);

  const emitChange = useDebouncedCallback(() => {
    const value = isHTML
      ? editor.blocksToHTMLLossy(editor.document)
      : JSON.stringify(editor.document);

    lastEditorOutputRef.current = value;
    onChange(value);
  }, 300);

  return () => {
    if (skipNextOnChangeRef.current) {
      skipNextOnChangeRef.current = false;

      return;
    }

    emitChange();
  };
};
