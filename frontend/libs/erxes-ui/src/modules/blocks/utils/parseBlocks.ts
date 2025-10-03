import { Block } from '@blocknote/core';

export const parseBlocks = (content: string) => {
  try {
    const blocks = JSON.parse(content) as Block[];

    if (
      Array.isArray(blocks) &&
      blocks.length > 0 &&
      blocks.every(
        (block) =>
          typeof block === 'object' &&
          block !== null &&
          'id' in block &&
          'type' in block &&
          'content' in block,
      )
    ) {
      return blocks;
    }
    return false;
  } catch (error) {
    return false;
  }
};
