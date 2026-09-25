import { IVisitedPageTab } from '@/navigation/types/VisitedPageTab';
import { normalizeVisitedPageTabs } from '@/navigation/utils/visitedPageTabs';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type VisitedPageTabsUpdate =
  | IVisitedPageTab[]
  | ((tabs: IVisitedPageTab[]) => IVisitedPageTab[]);

const storedVisitedPageTabsState = atomWithStorage<IVisitedPageTab[]>(
  'navigation:visited-page-tabs',
  [],
  undefined,
  {
    getOnInit: true,
  },
);

export const activeVisitedPageTabIdState = atomWithStorage<string | null>(
  'navigation:active-visited-page-tab-id',
  null,
);

export const visitedPageTabsVisibleState = atomWithStorage(
  'navigation:visited-page-tabs-visible',
  true,
);

export const visitedPageTabsState = atom(
  (get) => normalizeVisitedPageTabs(get(storedVisitedPageTabsState)),
  (get, set, update: VisitedPageTabsUpdate) => {
    const currentTabs = normalizeVisitedPageTabs(
      get(storedVisitedPageTabsState),
    );
    const nextTabs =
      typeof update === 'function' ? update(currentTabs) : update;

    set(storedVisitedPageTabsState, normalizeVisitedPageTabs(nextTabs));
  },
);
