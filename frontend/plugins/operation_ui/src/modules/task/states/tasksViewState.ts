import { atomWithStorage } from 'jotai/utils';

export const tasksViewAtom = atomWithStorage<'list' | 'grid'>(
  'tasksView',
  'list',
  undefined,
  {
    getOnInit: true,
  },
);
