import { atomWithStorage } from 'jotai/utils';

export const integrationCollapsibleState = atomWithStorage(
  'integrationCollapsibleState',
  false,
);

export const integrationTypeCollapsibleState = atomWithStorage(
  'integrationTypeCollapsibleState',
  false,
);
