import { atom, type useStore } from 'jotai';
import { currentUserState } from 'ui-modules';
import type { IHelpCenterConfigInput } from '@/helpcenter/types';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const helpCenterPanelDraftsState = atom<
  TPanelFormDrafts<IHelpCenterConfigInput>
>({});

export const helpCenterPanelCreatedState = atom<
  Record<string, { id: string; values: IHelpCenterConfigInput }>
>({});

export const helpCenterPanelPendingState = atom<ReadonlySet<string>>(
  new Set<string>(),
);
export const helpCenterNewDraftGenerationState = atom<Record<string, number>>(
  {},
);

export const helpCenterRemovedIdsState = atom<ReadonlySet<string>>(
  new Set<string>(),
);
export const helpCenterPanelSessionState = atom(0);
const observedStores = new WeakSet<ReturnType<typeof useStore>>();

export const observeHelpCenterSession = (
  store: ReturnType<typeof useStore>,
): void => {
  if (observedStores.has(store)) return;
  observedStores.add(store);
  let userId = store.get(currentUserState)?._id;
  store.sub(currentUserState, () => {
    const nextUserId = store.get(currentUserState)?._id;
    if (nextUserId === userId) return;
    userId = nextUserId;
    store.set(helpCenterPanelDraftsState, {});
    store.set(helpCenterPanelCreatedState, {});
    store.set(helpCenterPanelPendingState, new Set());
    store.set(helpCenterNewDraftGenerationState, {});
    store.set(helpCenterRemovedIdsState, new Set());
    store.set(helpCenterPanelSessionState, (previous) => previous + 1);
  });
};
