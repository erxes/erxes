import { useCreateBlockNote } from '@blocknote/react';
import { BLOCK_SCHEMA } from 'erxes-ui/modules/blocks/constant/blockEditorSchema';
import { BlockNoteView } from '@blocknote/shadcn';
import 'erxes-ui/modules/blocks/styles/styles.css';
import { useAtomValue } from 'jotai';
import { themeState } from 'erxes-ui/state';
import { parseBlocks } from '../utils';
import DOMPurify from 'dompurify';
import { cn } from 'erxes-ui/lib';
import React, { useMemo } from 'react';
export const BlockEditorReadOnly = React.forwardRef<
  HTMLDivElement,
  {
    content: string;
    className?: string;
  }
>(({ content, className }, ref) => {
  const contentBlocks = parseBlocks(content);

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    initialContent: contentBlocks || undefined,
  });
  const theme = useAtomValue(themeState);

  const sanitized = useMemo(
    () => (content ? DOMPurify.sanitize(content) : ''),
    [content],
  );

  if (!contentBlocks) {
    if (content) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: sanitized }}
          className={className}
          ref={ref}
        />
      );
    }
    return null;
  }

  return (
    <BlockNoteView
      className={cn('read-only', className)}
      editor={editor}
      editable={false}
      formattingToolbar={false}
      slashMenu={false}
      sideMenu={false}
      theme={theme as 'light' | 'dark'}
    />
  );
});
