import { parseBlocks, BlockEditorReadOnly } from 'erxes-ui';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

export const InternalNoteDisplay = ({ content }: { content: string }) => {
  const blocks = parseBlocks(content);

  const sanitized = useMemo(
    () => (content ? DOMPurify.sanitize(content) : ''),
    [content],
  );

  if (!blocks) {
    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
  }

  return <BlockEditorReadOnly content={content} />;
};
