import { atomWithStorage } from 'jotai/utils';

export type TFilesPreviewMode = 'sheet' | 'split';

/** Remembered per browser, like the automation history view mode. */
export const filesPreviewModeState = atomWithStorage<TFilesPreviewMode>(
  'filesPreviewMode',
  'sheet',
);
