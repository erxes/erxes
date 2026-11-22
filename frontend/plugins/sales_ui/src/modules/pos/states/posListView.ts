import { atomWithStorage } from 'jotai/utils';

export type TPosListView = 'card' | 'list';

export const posListViewAtom = atomWithStorage<TPosListView>(
  'salesPosListView',
  'card',
  undefined,
  {
    getOnInit: true,
  },
);
