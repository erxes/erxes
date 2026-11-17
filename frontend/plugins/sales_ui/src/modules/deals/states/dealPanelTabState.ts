import { atomWithStorage } from 'jotai/utils';

export const dealPanelTabAtom = atomWithStorage<string>(
  'erxes:dealPanelTab',
  '',
  undefined,
  {
    getOnInit: true,
  },
);
