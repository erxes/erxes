import { atom } from 'jotai';

export const taskTotalCountAtom = atom<number | null>(null);

export const taskCountByBoardAtom = atom<Record<string, number>>({});

export const taskTotalCountBoardAtom = atom((get) =>
  Object.values(get(taskCountByBoardAtom)).reduce((acc, curr) => acc + curr, 0),
);
