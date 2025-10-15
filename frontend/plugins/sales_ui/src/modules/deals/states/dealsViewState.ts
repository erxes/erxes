import { atomWithStorage } from 'jotai/utils';

export const dealsViewAtom = atomWithStorage<'list' | 'grid'>(
  'dealsView',
  'list',
  undefined,
  {
    getOnInit: true,
  },
);
