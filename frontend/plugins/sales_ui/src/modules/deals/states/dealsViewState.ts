import { atomWithStorage } from 'jotai/utils';

export const dealsViewAtom = atomWithStorage<'board' | 'list'>(
  'dealsView',
  'board',
  undefined,
  {
    getOnInit: true,
  },
);
