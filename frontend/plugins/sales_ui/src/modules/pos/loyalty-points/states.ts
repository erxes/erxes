import { atom } from 'jotai';

// Movements the page's filters match; null until the list answers.
export const posLoyaltyCountAtom = atom<number | null>(null);
