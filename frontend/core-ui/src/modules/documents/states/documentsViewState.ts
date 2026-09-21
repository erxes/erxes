import { atomWithStorage } from 'jotai/utils';

export type DocumentsView = 'grid' | 'list';

export const documentsViewAtom = atomWithStorage<DocumentsView>(
  'documentsView',
  'grid',
  undefined,
  {
    getOnInit: true,
  },
);
