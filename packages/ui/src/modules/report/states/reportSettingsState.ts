import { atomWithStorage } from 'jotai/utils';

export const printSettingsAtom = atomWithStorage<{
  showTableLayoutOnEveryPage: boolean;
  printsize: number;
}>('printSettings', {
  printsize: 100,
  showTableLayoutOnEveryPage: true,
});
