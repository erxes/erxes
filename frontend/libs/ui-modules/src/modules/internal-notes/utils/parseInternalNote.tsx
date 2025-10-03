import { Block } from '@blocknote/core';

export const parseInternalNote = (content: string) => {
  try {
    const blocks = JSON.parse(content) as Block[];
    return blocks;
  } catch (error) {
    return false;
  }
}