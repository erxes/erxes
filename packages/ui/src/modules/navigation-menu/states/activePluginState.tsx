import { atomWithStorage } from 'jotai/utils';

export const activePluginState = atomWithStorage<string | null>(
  'activePlugin',
  null,
  undefined,
  {
    getOnInit: true,
  },
);
