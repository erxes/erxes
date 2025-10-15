import { atom } from 'jotai';

export const dealTotalCountAtom = atom<number | null>(null);

export const dealCountByBoardAtom = atom<Record<string, number>>({});

export const dealTotalCountBoardAtom = atom((get) =>
  Object.values(get(dealCountByBoardAtom)).reduce((acc, curr) => acc + curr, 0),
);
