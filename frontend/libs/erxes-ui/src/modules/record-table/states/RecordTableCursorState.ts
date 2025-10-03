import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export const recordTableCursorAtomFamily = atomFamily((key: string) =>
  atom<string | null>(null),
);
