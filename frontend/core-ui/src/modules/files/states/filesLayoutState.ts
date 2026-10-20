import { atomWithStorage } from 'jotai/utils';

export type TFilesLayout = 'list' | 'grid';

/** Remembered per browser, like the email templates layout. */
export const filesLayoutState = atomWithStorage<TFilesLayout>(
  'filesLayout',
  'list',
);
