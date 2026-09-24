import { atomWithStorage } from 'jotai/utils';

export type TEmailTemplatesLayout = 'list' | 'grid';

/** Remembered per browser, the way the other lists remember their own. */
export const emailTemplatesLayoutState = atomWithStorage<TEmailTemplatesLayout>(
  'emailTemplatesLayout',
  'grid',
);
