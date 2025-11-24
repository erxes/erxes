import { atomWithStorage } from 'jotai/utils';

export const dealsViewAtom = atomWithStorage<'list' | 'board'>(
  'dealsView',
  'board',
  undefined,
  {
    getOnInit: true,
  },
);
