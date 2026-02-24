import { useEffect, useRef } from 'react';
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
  ...props
}: Omit<BlockEditorProps, 'editor' | 'onChange'> & IEditorProps) => {
  const skipNextOnChangeRef = useRef(false);
  const parsedInitialContent = parseBlocks(initialContent ?? '');
  const editor = useBlockEditor({
    initialContent: parsedInitialContent || undefined,
  });

  useEffect(() => {
    async function loadInitialHTML(initialHTML?: string) {
      if (!initialHTML) return;
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
      return;
    };
  }, [editor, initialContent, isHTML]);

  const handleChange = async () => {
    if (skipNextOnChangeRef.current) {
      skipNextOnChangeRef.current = false;
      return;
    }

    const content = await editor?.document;
    if (isHTML) {
      const htmlContent = await editor?.blocksToHTMLLossy(content as Block[]);
      onChange(htmlContent);
    } else {
      onChange(JSON.stringify(content));
    }
  };

  return (
    <BlockEditor
      variant="outline"
      className={cn(
        'overflow-y-auto h-28 rounded-md min-h-28 styled-scroll',
        className,
      )}
      {...props}
      editor={editor}
      onChange={handleChange}
    />
  );
};
