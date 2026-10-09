import { atomWithStorage } from 'jotai/utils';

export type TTopicsView = 'list' | 'thumbnail';

export const topicsViewAtom = atomWithStorage<TTopicsView>(
  'kbTopicsView',
  'thumbnail',
  undefined,
  {
    getOnInit: true,
  },
);
