import { atomWithStorage } from 'jotai/utils';

export type TDealsView = 'board' | 'list' | 'points';

export const dealsViewAtom = atomWithStorage<TDealsView>(
  'dealsView',
  'board',
  undefined,
  {
    getOnInit: true,
  },
);
