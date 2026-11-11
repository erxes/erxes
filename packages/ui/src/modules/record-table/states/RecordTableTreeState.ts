import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const recordTableTreeHideChildrenAtomFamily = atomFamily((key: string) =>
  atom<string[]>([]),
);
