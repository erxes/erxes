import { atom } from 'jotai';

export const addingTagAtom = atom<'tag' | 'group' | null>(null);
