import { atom } from 'jotai';

export const ticketTotalCountAtom = atom<number | null>(null);

export const ticketCountByBoardAtom = atom<Record<string, number>>({});

export const ticketTotalCountBoardAtom = atom((get) =>
  Object.values(get(ticketCountByBoardAtom)).reduce((acc, curr) => acc + curr, 0),
);
