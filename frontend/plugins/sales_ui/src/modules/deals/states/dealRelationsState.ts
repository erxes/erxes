import { atomWithStorage } from 'jotai/utils';

export const dealRelationsFoldedAtom = atomWithStorage<Record<string, boolean>>(
  'erxes:dealRelationsFolded',
  {},
  undefined,
  {
    getOnInit: true,
  },
);
