import { atomWithStorage } from 'jotai/utils';

export type TEmailTemplatesView = 'grid' | 'table';

/** Remembered per browser, the way the documents list remembers its own. */
export const emailTemplatesViewAtom = atomWithStorage<TEmailTemplatesView>(
  'emailTemplatesView',
  'grid',
);
