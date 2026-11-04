import { useCallback, useEffect, useRef } from 'react';
import { currentUserState, useSidePanel } from 'ui-modules';
import { useStore } from 'jotai';
import {
  articlePanelDraftsState,
  categoryPanelDraftsState,
  topicPanelDraftsState,
  kbPanelSavesState,
  kbPanelDraftKey,
  kbPanelDraftRevisionsState,
} from '../states/panelFormDraftsState';
import { KB_RECORD_CONTENT_TYPES } from '@/knowledgebase/constants';

/** Clears removed-record drafts and closes only the relevant active panel. */
export const useKbCloseRemovedRecord = (
  contentType: string,
): ((contentId: string) => void) => {
  const { record, close } = useSidePanel();
  const store = useStore();
  const latest = useRef({ record, close });
  const active = useRef(false);
  latest.current = { record, close };

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  return useCallback(
    (contentId: string) => {
      const userId = store.get(currentUserState)?._id;
      const articleKey = kbPanelDraftKey(userId, 'article', contentId);
      const categoryKey = kbPanelDraftKey(userId, 'category', contentId);
      const topicKey = kbPanelDraftKey(userId, 'topic', contentId);
      const removedKeys = new Set<string>();
      if (contentType === KB_RECORD_CONTENT_TYPES.article)
        removedKeys.add(articleKey);
      if (contentType === KB_RECORD_CONTENT_TYPES.category)
        removedKeys.add(categoryKey);
      if (contentType === KB_RECORD_CONTENT_TYPES.topic)
        removedKeys.add(topicKey);
      for (const [key, saved] of Object.entries(store.get(kbPanelSavesState))) {
        if (saved?.createdId === contentId) removedKeys.add(key);
      }
      store.set(articlePanelDraftsState, (previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(([key, draft]) => {
            const remove =
              removedKeys.has(key) ||
              (contentType === KB_RECORD_CONTENT_TYPES.category &&
                (draft?.values.categoryId === contentId ||
                  draft?.defaultValues.categoryId === contentId)) ||
              (contentType === KB_RECORD_CONTENT_TYPES.topic &&
                (draft?.values.topicId === contentId ||
                  draft?.defaultValues.topicId === contentId));
            if (remove) removedKeys.add(key);
            return !remove;
          }),
        ),
      );
      store.set(categoryPanelDraftsState, (previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(([key, draft]) => {
            const remove =
              removedKeys.has(key) ||
              (contentType === KB_RECORD_CONTENT_TYPES.category &&
                (draft?.values.parentCategoryId === contentId ||
                  draft?.defaultValues.parentCategoryId === contentId)) ||
              (contentType === KB_RECORD_CONTENT_TYPES.topic &&
                (draft?.values.topicId === contentId ||
                  draft?.defaultValues.topicId === contentId));
            if (remove) removedKeys.add(key);
            return !remove;
          }),
        ),
      );
      store.set(topicPanelDraftsState, (previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(([key]) => !removedKeys.has(key)),
        ),
      );
      store.set(kbPanelSavesState, (previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(
            ([key, save]) =>
              !removedKeys.has(key) && save?.createdId !== contentId,
          ),
        ),
      );
      store.set(kbPanelDraftRevisionsState, (previous) => {
        const next = { ...previous };
        for (const key of removedKeys) next[key] = (next[key] ?? 0) + 1;
        return next;
      });
      const current = latest.current;
      if (
        active.current &&
        current.record?.contentType === contentType &&
        current.record.contentId === contentId
      ) {
        current.close();
      }
    },
    [contentType, store],
  );
};
