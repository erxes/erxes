import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const activeCardIdState = atomFamily(() => atom<string | null>(null));

export const dragOverBoardColumnIdState = atomFamily(() =>
  atom<string | null>(null),
);
