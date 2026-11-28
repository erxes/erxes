import { createContext } from 'react';

export const DATA_PATH_TYPE = 'application/x-erxes-data-path';

type Insert = (path: string) => void;

export type DataTargets = {
  own: (insert: Insert) => void;
  release: (insert: Insert) => void;
  insert: (path: string) => boolean;
};

export const dataTargets = (): DataTargets => {
  let current: Insert | null = null;

  return {
    own: (insert) => {
      current = insert;
    },
    release: (insert) => {
      if (current === insert) current = null;
    },
    insert: (path) => {
      current?.(path);

      return current !== null;
    },
  };
};

export const DataTargetContext = createContext<DataTargets>(dataTargets());

export const rangeAt = (x: number, y: number) => {
  const position = document.caretPositionFromPoint(x, y);

  if (!position) return null;

  const range = document.createRange();

  range.setStart(position.offsetNode, position.offset);
  range.collapse(true);

  return range;
};
