import { atomWithStorage } from 'jotai/utils';

export const inboxLayoutState = atomWithStorage<'list' | 'split'>(
  'inboxLayoutState',
  'list',
);
