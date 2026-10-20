import { atomWithStorage } from 'jotai/utils';

export type TFilesPreviewMode = 'sheet' | 'split';

export const filesPreviewModeState = atomWithStorage<TFilesPreviewMode>(
  'filesPreviewMode',
  'sheet',
);
