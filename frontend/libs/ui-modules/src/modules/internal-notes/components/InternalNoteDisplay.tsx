import { parseBlocks, BlockEditorReadOnly } from 'erxes-ui';

export const InternalNoteDisplay = ({ content }: { content: string }) => {
  const blocks = parseBlocks(content);

  if (!blocks) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return <BlockEditorReadOnly content={content} />;
};
