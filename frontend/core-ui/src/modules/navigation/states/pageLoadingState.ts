import { atom } from 'jotai';

type PageLoadingSourceUpdate = {
  isLoading: boolean;
  pathname: string;
  sourceId: string;
};

const pageLoadingSourcesState = atom<Map<string, string>>(new Map());

export const pageLoadingPathnamesState = atom(
  (get) => new Set(get(pageLoadingSourcesState).values()),
);

export const updatePageLoadingSourceState = atom(
  null,
  (get, set, update: PageLoadingSourceUpdate) => {
    const loadingSources = new Map(get(pageLoadingSourcesState));

    if (update.isLoading) {
      loadingSources.set(update.sourceId, update.pathname);
    } else {
      loadingSources.delete(update.sourceId);
    }

    set(pageLoadingSourcesState, loadingSources);
  },
);
