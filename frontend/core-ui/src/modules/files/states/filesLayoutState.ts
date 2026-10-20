import { atomWithStorage } from 'jotai/utils';

export type TFilesLayout = 'list' | 'grid';

export const filesLayoutState = atomWithStorage<TFilesLayout>(
  'filesLayout',
  'list',
);
