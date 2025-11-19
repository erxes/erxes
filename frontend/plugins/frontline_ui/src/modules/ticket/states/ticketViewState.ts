import { atomWithStorage } from 'jotai/utils';

export const ticketViewAtom = atomWithStorage<'list' | 'grid'>(
  'ticketView',
  'list',
  undefined,
  {
    getOnInit: true,
  },
);
