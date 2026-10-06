import type { IBlockEditor } from 'erxes-ui';

export const normalizeDescriptionBlocks = (
  content: Readonly<IBlockEditor['document']>,
): IBlockEditor['document'] => {
  const blocks = [...content];
  const lastBlock = blocks[blocks.length - 1];

  if (
    blocks.length > 1 &&
    lastBlock.type === 'paragraph' &&
    Array.isArray(lastBlock.content) &&
    lastBlock.content.length === 0
  ) {
    blocks.pop();
  }

  return blocks;
};
