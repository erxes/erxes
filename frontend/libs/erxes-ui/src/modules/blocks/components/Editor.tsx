import { useCallback, useEffect, useRef } from 'react';
import { useBlockEditor } from '../hooks/useBlockEditor';
import { BlockEditor } from './BlockEditor';
import { Block } from '@blocknote/core';
import { BlockEditorProps, IEditorProps } from '../types';
import { cn } from 'erxes-ui/lib';
import { parseBlocks } from '../utils';

export const Editor = ({
  onChange,
  initialContent,
  scope,
  className,
  isHTML = false,
  uploadFile,
  ...props
}: Omit<BlockEditorProps, 'editor' | 'onChange'> & IEditorProps) => {
  const skipNextOnChangeRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);
  const parsedInitialContent = parseBlocks(initialContent ?? '');
  const editor = useBlockEditor({
    initialContent: parsedInitialContent || undefined,
    uploadFile,
  });

  useEffect(() => {
    async function loadInitialHTML(initialHTML?: string) {
      if (!initialHTML) return;
      // Support legacy JSON content stored before isHTML mode was used
      const parsed = parseBlocks(initialHTML);
      if (parsed) {
        editor.replaceBlocks(editor.document, parsed);
        return;
      }
      const blocks = await editor.tryParseHTMLToBlocks(initialHTML);
      editor.replaceBlocks(editor.document, blocks);
    }
    if (isHTML) {
      loadInitialHTML(initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  useEffect(() => {
    if (isHTML) return;

    let isActive = true;
    const syncContent = async () => {
      const parsed = parseBlocks(initialContent ?? '');
      if (parsed) {
        const currentSerialized = JSON.stringify(editor.document);
        const nextSerialized = JSON.stringify(parsed);

        if (!isActive) return;

        if (currentSerialized !== nextSerialized) {
          skipNextOnChangeRef.current = true;
          editor.replaceBlocks(editor.document, parsed);
        }
        return;
      }

      if (typeof initialContent !== 'string' || !initialContent.trim()) {
        return;
      }

      try {
        const blocks = await editor.tryParseHTMLToBlocks(initialContent);
        if (!isActive) return;

        const currentSerialized = JSON.stringify(editor.document);
        const nextSerialized = JSON.stringify(blocks);

        if (currentSerialized !== nextSerialized) {
          skipNextOnChangeRef.current = true;
          editor.replaceBlocks(editor.document, blocks);
        }
      } catch {
        // ignore parsing errors for legacy/plain text content
      }
    };

    syncContent();

    return () => {
      isActive = false;
    };
  }, [editor, initialContent, isHTML]);

  const handleChange = useCallback(() => {
    if (skipNextOnChangeRef.current) {
      skipNextOnChangeRef.current = false;
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      const content = editor?.document;
      if (!content) return;
      if (isHTML) {
        const htmlContent = await editor.blocksToHTMLLossy(content as Block[]);
        onChange(htmlContent);
      } else {
        onChange(JSON.stringify(content));
      }
    }, 300);
  }, [editor, isHTML, onChange]);

  return (
    <BlockEditor
      variant="outline"
      className={cn(
        'min-w-0 w-full overflow-x-hidden overflow-y-auto h-28 rounded-md min-h-28 styled-scroll shadow-xs transition-[color,box-shadow]',
        className,
      )}
      {...props}
      editor={editor}
      onChange={handleChange}
    />
  );
};
