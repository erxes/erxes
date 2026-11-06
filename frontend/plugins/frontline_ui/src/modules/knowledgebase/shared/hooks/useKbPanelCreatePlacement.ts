import { atom, useAtomValue, useStore } from 'jotai';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  currentUserState,
  sidePanelDraftState,
  type ISidePanelDraft,
} from 'ui-modules';

type TPlacement = { topicId: string; categoryId: string };
const emptyPlacement: TPlacement = { topicId: '', categoryId: '' };
const placementsState = atom<Record<string, TPlacement | undefined>>({});
const acceptedPlacementState = atom<{
  scopeKey: string;
  entryKey: string;
  source: ISidePanelDraft | null;
  placement: TPlacement;
} | null>(null);
const ignoredDraftState = atom<ISidePanelDraft | null>(null);
const observedStores = new WeakSet<ReturnType<typeof useStore>>();

const observeSession = (store: ReturnType<typeof useStore>): void => {
  if (observedStores.has(store)) return;
  observedStores.add(store);
  let userId = store.get(currentUserState)?._id;
  store.sub(currentUserState, () => {
    const nextUserId = store.get(currentUserState)?._id;
    if (userId === nextUserId) return;
    userId = nextUserId;
    store.set(ignoredDraftState, store.get(sidePanelDraftState));
    store.set(acceptedPlacementState, null);
    store.set(placementsState, {});
  });
};

const readPlacement = (source: ISidePanelDraft | null): TPlacement => ({
  topicId:
    typeof source?.defaults.topicId === 'string' ? source.defaults.topicId : '',
  categoryId:
    typeof source?.defaults.categoryId === 'string'
      ? source.defaults.categoryId
      : '',
});

export const useKbPanelCreatePlacement = (contentType: string): TPlacement => {
  const store = useStore();
  const userId = useAtomValue(currentUserState)?._id;
  const source = useAtomValue(sidePanelDraftState);
  const ignoredDraft = useAtomValue(ignoredDraftState);
  const { key } = useLocation();
  const scopeKey = JSON.stringify([userId, contentType]);
  const entryKey = JSON.stringify([userId, contentType, key]);
  const saved = useAtomValue(placementsState)[entryKey];
  const accepted = useAtomValue(acceptedPlacementState);
  const acceptsSource = Boolean(
    userId && source?.contentType === contentType && source !== ignoredDraft,
  );

  let fallback = acceptsSource ? readPlacement(source) : emptyPlacement;
  if (
    accepted?.scopeKey === scopeKey &&
    (accepted.source === source || !acceptsSource)
  )
    fallback = accepted.placement;
  const placement = saved ?? fallback;

  useEffect(() => {
    observeSession(store);
    if (!userId) return undefined;
    const select = (next: TPlacement) =>
      store.set(acceptedPlacementState, {
        scopeKey,
        entryKey,
        source,
        placement: next,
      });
    const remember = (next: TPlacement) => {
      store.set(placementsState, (entries) => ({
        ...entries,
        [entryKey]: next,
      }));
      select(next);
    };
    const current = store.get(placementsState)[entryKey];
    const previous = store.get(acceptedPlacementState);
    if (!current) {
      remember(placement);
      return undefined;
    }
    if (previous?.entryKey !== entryKey) {
      select(current);
      return undefined;
    }
    if (previous.source === source || !acceptsSource) return undefined;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled && store.get(currentUserState)?._id === userId) {
        remember(readPlacement(source));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [store, userId, scopeKey, entryKey, source, acceptsSource, placement]);

  return placement;
};
