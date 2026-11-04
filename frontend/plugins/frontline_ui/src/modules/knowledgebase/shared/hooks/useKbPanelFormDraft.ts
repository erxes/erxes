import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import {
  articlePanelDraftsState,
  categoryPanelDraftsState,
  topicPanelDraftsState,
  kbPanelSavesState,
  kbPanelDraftKey,
  kbPanelDraftRevisionsState,
} from '../states/panelFormDraftsState';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import { type PrimitiveAtom, useAtomValue, useStore } from 'jotai';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';
import { currentUserState } from 'ui-modules';
import { useEffect, useRef } from 'react';

const observedStores = new WeakSet<ReturnType<typeof useStore>>();

/** Installs one store-lifetime user observer to clear private knowledge base drafts. */
const observeSession = (store: ReturnType<typeof useStore>): void => {
  if (observedStores.has(store)) return;
  observedStores.add(store);
  let userId = store.get(currentUserState)?._id;
  store.sub(currentUserState, () => {
    const nextUserId = store.get(currentUserState)?._id;
    if (userId === nextUserId) return;
    userId = nextUserId;
    store.set(articlePanelDraftsState, {});
    store.set(categoryPanelDraftsState, {});
    store.set(topicPanelDraftsState, {});
    store.set(kbPanelSavesState, {});
    store.set(kbPanelDraftRevisionsState, {});
  });
};

/** Adds user scope, create deduplication and deletion invalidation to panel drafts. */
export const useKbPanelFormDraft = <T extends FieldValues>({
  form,
  kind,
  recordId,
  context,
  draftsState,
  values,
  discardMessage,
  onDeleted,
}: {
  form: UseFormReturn<T>;
  kind: 'article' | 'category' | 'topic';
  recordId?: string | null;
  context: string[];
  draftsState: PrimitiveAtom<TPanelFormDrafts<T>>;
  values: T;
  discardMessage: string;
  onDeleted?: () => void;
}): {
  clearDraft: () => void;
  markSaved: (savedValues: T, submittedValues?: T) => boolean;
  isActive: () => boolean;
  saving: boolean;
  captureUpdate: (field?: string) => (update: (latest: T) => T) => void;
  invalidateUpdates: (field: string) => void;
  save: (
    action: (id?: string) => Promise<string | null>,
  ) => Promise<string | null>;
} => {
  const store = useStore();
  const userId = useAtomValue(currentUserState)?._id;
  const recordKey = kbPanelDraftKey(userId, kind, recordId, context);
  const saves = useAtomValue(kbPanelSavesState);
  const createdId = !recordId ? saves[recordKey]?.createdId : undefined;
  const confirmedValues = createdId
    ? store.get(draftsState)[recordKey]?.defaultValues
    : undefined;
  const revision = useAtomValue(kbPanelDraftRevisionsState)[recordKey] ?? 0;
  const scope = useRef({ recordKey, revision, handled: false });
  if (scope.current.recordKey !== recordKey)
    scope.current = { recordKey, revision, handled: false };
  const scopeRevision = scope.current.revision;
  useEffect(() => {
    observeSession(store);
    const saved = store.get(kbPanelSavesState)[recordKey];
    if (saved && !saved.pending && !store.get(draftsState)[recordKey]) {
      store.set(kbPanelSavesState, (previous) => {
        return Object.fromEntries(
          Object.entries(previous).filter(([key]) => key !== recordKey),
        );
      });
    }
  }, [store, draftsState, recordKey]);
  const {
    clearDraft: clearFormDraft,
    isActive: isFormActive,
    markSaved: markFormSaved,
    captureUpdate: captureFormUpdate,
    invalidateUpdates,
  } = usePanelFormDraft({
    form,
    recordKey,
    values: confirmedValues ?? values,
    draftsState,
    isNew: !recordId && !createdId && scopeRevision === revision,
    discardMessage,
  });
  /** Checks that the captured user and draft revision still own this form session. */
  const sameSession = () =>
    Boolean(
      userId &&
        store.get(currentUserState)?._id === userId &&
        (store.get(kbPanelDraftRevisionsState)[recordKey] ?? 0) ===
          scopeRevision,
    );
  useEffect(() => {
    if (scopeRevision === revision || scope.current.handled) return;
    scope.current.handled = true;
    clearFormDraft();
    form.reset(values);
    if (isFormActive() && userId && store.get(currentUserState)?._id === userId)
      onDeleted?.();
  }, [
    scopeRevision,
    revision,
    clearFormDraft,
    isFormActive,
    form,
    values,
    onDeleted,
    store,
    userId,
  ]);
  /** Clears this form draft and any completed create association. */
  const clearDraft = () => {
    clearFormDraft();
    store.set(kbPanelSavesState, (previous) => {
      if (previous[recordKey]?.pending) return previous;
      return Object.fromEntries(
        Object.entries(previous).filter(([key]) => key !== recordKey),
      );
    });
  };
  /** Serializes saves for this scope and retains the created record identifier. */
  const save = async (
    action: (id?: string) => Promise<string | null>,
  ): Promise<string | null> => {
    const previous = store.get(kbPanelSavesState)[recordKey];
    if (!sameSession() || previous?.pending) return null;
    const pendingSave = { ...previous, pending: true };
    store.set(kbPanelSavesState, (state) => ({
      ...state,
      [recordKey]: pendingSave,
    }));
    try {
      const id = await action(recordId || previous?.createdId);
      if (
        !sameSession() ||
        store.get(kbPanelSavesState)[recordKey] !== pendingSave
      )
        return null;
      store.set(kbPanelSavesState, (state) => ({
        ...state,
        [recordKey]: { pending: false, createdId: id || previous?.createdId },
      }));
      return id;
    } finally {
      if (
        sameSession() &&
        store.get(kbPanelSavesState)[recordKey] === pendingSave
      )
        store.set(kbPanelSavesState, (state) => ({
          ...state,
          [recordKey]: { ...pendingSave, pending: false },
        }));
    }
  };
  return {
    clearDraft,
    invalidateUpdates,
    captureUpdate: (field) => {
      const updateDraft = captureFormUpdate(field);
      return (update) => {
        if (sameSession()) updateDraft(update);
      };
    },
    markSaved: (savedValues, submittedValues) =>
      sameSession() && markFormSaved(savedValues, submittedValues),
    isActive: () => sameSession() && isFormActive(),
    saving: Boolean(saves[recordKey]?.pending),
    save,
  };
};
