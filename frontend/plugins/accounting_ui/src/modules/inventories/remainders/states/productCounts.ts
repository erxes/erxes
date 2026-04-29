import { atom } from 'jotai';

export const productTotalCountAtom = atom<number | null>(null);

export const selectedProductIdsAtom = atom<string[]>([]);
