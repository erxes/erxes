import { atomWithStorage } from 'jotai/utils';

export const surveyViewAtom = atomWithStorage<'list' | 'grid'>(
  'surveyView',
  'grid',
  undefined,
  {
    getOnInit: true,
  },
);
