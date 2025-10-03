import { atomWithStorage } from 'jotai/utils';

export const integrationCollapsibleState = atomWithStorage(
  'integrationCollapsibleState',
  false,
);
