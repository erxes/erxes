import { IVisitedPageTab } from '@/navigation/types/VisitedPageTab';
import { atomWithStorage } from 'jotai/utils';

export const visitedPageTabsState = atomWithStorage<IVisitedPageTab[]>(
  'navigation:visited-page-tabs',
  [],
  undefined,
  {
    getOnInit: true,
  },
);
