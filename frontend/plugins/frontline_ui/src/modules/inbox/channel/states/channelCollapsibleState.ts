import { atomWithStorage } from 'jotai/utils';

export const channelCollapsibleState = atomWithStorage<boolean>(
  'channelCollapsibleState',
  false,
);
