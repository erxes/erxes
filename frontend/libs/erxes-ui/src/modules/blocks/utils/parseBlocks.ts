import { Block } from '@blocknote/core';

const isValidBlocks = (blocks: unknown): blocks is Block[] =>
  Array.isArray(blocks) &&
  blocks.length > 0 &&
  blocks.every(
    (block) =>
      typeof block === 'object' &&
      block !== null &&
      'id' in block &&
      'type' in block &&
      'content' in block,
  );

export const parseBlocks = (content: unknown) => {
  try {
    if (isValidBlocks(content)) {
      return content;
    }

    if (typeof content !== 'string' || !content.trim()) {
      return false;
    }

    const blocks = JSON.parse(content) as Block[];

    if (isValidBlocks(blocks)) {
      return blocks;
    }
    return false;
  } catch {
    return false;
  }
};
