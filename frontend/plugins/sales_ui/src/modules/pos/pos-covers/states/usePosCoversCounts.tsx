import { atom } from 'jotai';

export const posCoverTotalCountAtom = atom<number | null>(null);

export const posCoverTotalCountLoadingAtom = atom<boolean>(true);
