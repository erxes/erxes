import type { EditorBlock } from '../types/EditorBlock';

export const isEmptyBlock = (block?: EditorBlock) => {
  if (!block) {
    return false;
  }

  return (
    Array.isArray(block.content) &&
    !block.content.length &&
    !block.children?.length
  );
};
