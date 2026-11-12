import { BlockEditorEditableContext } from '../hooks/useBlockEditorEditable';
import { useCreateBlockNote } from '@blocknote/react';
import { BLOCK_SCHEMA } from 'erxes-ui/modules/blocks/constant/blockEditorSchema';
import { BlockNoteView } from '@blocknote/shadcn';
import { useAtomValue } from 'jotai';
import { themeState } from 'erxes-ui/state/themeState';
import { parseBlocks } from '../utils/parseBlocks';
import DOMPurify from 'dompurify';
import { cn } from 'erxes-ui/lib/utils';
import React, { useEffect, useRef } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { readImage } from '../../../utils/core';

// Content saved as HTML (not blocks) renders as sanitized DOM nodes.
const SanitizedHtml = React.forwardRef<HTMLDivElement, { html: string; className?: string }>(
  ({ html, className }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      containerRef.current?.replaceChildren(
        DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true }),
      );
    }, [html]);

    return <div className={className} ref={mergeRefs([containerRef, ref])} />;
  },
);

SanitizedHtml.displayName = 'SanitizedHtml';

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
    resolveFileUrl: (url) => Promise.resolve(readImage(url)),
  });

  const theme = useAtomValue(themeState);

  // The editor instance keeps its initialContent; sync blocks when the
  // content prop changes after mount.
  useEffect(() => {
    const blocks = parseBlocks(content);

    if (blocks) {
      editor.replaceBlocks(editor.document, blocks);
    }
  }, [editor, content]);

  if (!contentBlocks) {
    return content ? <SanitizedHtml html={content} className={className} ref={ref} /> : null;
  }

  return (
    <BlockEditorEditableContext.Provider value={false}>
      <BlockNoteView
        className={cn('read-only', className)}
        editor={editor}
        editable={false}
        formattingToolbar={false}
        slashMenu={false}
        sideMenu={false}
        theme={theme === 'system' ? undefined : theme}
      />
    </BlockEditorEditableContext.Provider>
  );
});
