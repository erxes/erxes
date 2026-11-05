import { atom } from 'jotai';
import type { TArticleForm } from '@/knowledgebase/articles/components/ArticleDrawer';
import type { TCategoryForm } from '@/knowledgebase/categories/components/CategoryDrawer';
import type { TTopicForm } from '@/knowledgebase/topics/components/TopicFormFields';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';

export const kbPanelDraftKey = (
  userId: string | undefined,
  kind: string,
  recordId?: string | null,
  context: string[] = [],
): string =>
  JSON.stringify([userId ?? null, kind, recordId || ['new', ...context]]);

export const articlePanelDraftsState = atom<TPanelFormDrafts<TArticleForm>>({});
export const categoryPanelDraftsState = atom<TPanelFormDrafts<TCategoryForm>>(
  {},
);
export const topicPanelDraftsState = atom<TPanelFormDrafts<TTopicForm>>({});
export const kbPanelDraftRevisionsState = atom<Record<string, number>>({});

export const kbPanelSavesState = atom<
  Record<
    string,
    | {
        pending: boolean;
        createdId?: string;
      }
    | undefined
  >
>({});
