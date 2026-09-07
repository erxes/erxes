import type { Block } from '@blocknote/core';

const isEmptyParagraph = (block: Block) =>
  block.type === 'paragraph' &&
  !block.content?.length &&
  !block.children?.length;

export const trimEmptyBlocks = (blocks: Block[]) => {
  const start = blocks.findIndex((block) => !isEmptyParagraph(block));
  if (start === -1) return [];
  let end = blocks.length - 1;
  while (end > start && isEmptyParagraph(blocks[end])) end--;
  return blocks.slice(start, end + 1);
};

export const parseTemplateToBlocks = (templateHtml: string) => {
  try {
    const parsed = JSON.parse(templateHtml);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // not serialized blocks - fall through to plain text
  }
  return [
    {
      type: 'paragraph',
      content: templateHtml.replace(/<[^>]+>/g, '').trim(),
      props: {},
    },
  ];
};
