import type { Block } from '@blocknote/core';

const isEmptyParagraph = (block: Block) =>
  block.type === 'paragraph' &&
  (!block.content || block.content.length === 0) &&
  (!block.children || block.children.length === 0);

/**
 * BlockNote keeps a trailing empty paragraph and happily collects leading ones,
 * so strip them before deciding whether the author actually typed something.
 */
export const trimEmptyBlocks = (content: Block[]): Block[] => {
  let start = 0;
  while (start < content.length && isEmptyParagraph(content[start])) {
    start++;
  }

  let end = content.length - 1;
  while (end >= start && isEmptyParagraph(content[end])) {
    end--;
  }

  return content.slice(start, end + 1);
};

/**
 * The shape `getMentionedUserIds` (erxes-ui) describes its input with. BlockNote's
 * `Block` matches it at runtime but not structurally, because `content` there is
 * a union of styled text and links rather than a plain `{ type, props }` list.
 */
type MentionScanBlock = {
  content?: { type: string; props: Record<string, string> }[];
};

/**
 * Narrows editor blocks to what `getMentionedUserIds` accepts. The cast lives
 * here alone so call sites stay free of it.
 */
export const toMentionScanBlocks = (blocks: Block[]): MentionScanBlock[] =>
  blocks as unknown as MentionScanBlock[];
