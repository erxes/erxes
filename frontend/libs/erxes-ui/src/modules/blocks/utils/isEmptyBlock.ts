import type { EditorBlock } from 'erxes-ui/modules/blocks/types/EditorBlock';

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
