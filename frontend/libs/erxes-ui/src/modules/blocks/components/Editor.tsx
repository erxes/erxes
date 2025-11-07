import { useEffect, useMemo, useState } from 'react';
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
  const editor = useBlockEditor({
    initialContent: parseBlocks(initialContent || '') as Block[],
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

  const handleChange = async () => {
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
        'h-28 rounded-md min-h-28 overflow-y-auto styled-scroll',
        className,
      )}
      {...props}
      editor={editor}
      onChange={handleChange}
    />
  );
};
