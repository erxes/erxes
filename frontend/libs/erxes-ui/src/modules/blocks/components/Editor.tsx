import { useEffect, useMemo, useState } from 'react';
import { useBlockEditor } from '../hooks/useBlockEditor';
import { BlockEditor } from './BlockEditor';
import { Block } from '@blocknote/core';
import { BlockEditorProps, IEditorProps } from '../types';
import { cn } from 'erxes-ui/lib';

export const Editor = ({
  onChange,
  initialContent,
  scope,
  className,
  isHTML = false,
  ...props
}: Omit<BlockEditorProps, 'editor' | 'onChange'> & IEditorProps) => {
  const editor = useBlockEditor();
  const [mounted, setMounted] = useState(false);

  const initialContentBlocks = useMemo(() => {
    if (isHTML && initialContent) {
      return editor?.tryParseHTMLToBlocks(initialContent);
    }
    return initialContent ? JSON.parse(initialContent) : undefined;
  }, [initialContent, isHTML, editor]);

  useEffect(() => {
    if (initialContentBlocks && !mounted) {
      setMounted(true);
      editor?.replaceBlocks(editor?.document, initialContentBlocks);
    }
  }, [editor, initialContentBlocks, mounted]);

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
