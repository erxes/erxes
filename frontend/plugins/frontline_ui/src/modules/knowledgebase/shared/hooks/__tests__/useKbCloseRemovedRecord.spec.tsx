import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider, type PrimitiveAtom } from 'jotai';
import { useForm, type FieldValues } from 'react-hook-form';
import { useKbPanelFormDraft } from '../useKbPanelFormDraft';
import type { TPanelFormDrafts } from '@/shared/hooks/usePanelFormDraft';
import { useKbCloseRemovedRecord } from '../useKbCloseRemovedRecord';
import {
  articlePanelDraftsState,
  categoryPanelDraftsState,
  topicPanelDraftsState,
  kbPanelSavesState,
  kbPanelDraftKey,
} from '../../states/panelFormDraftsState';
import type { TArticleForm } from '@/knowledgebase/articles/components/ArticleDrawer';
import type { TCategoryForm } from '@/knowledgebase/categories/components/CategoryDrawer';
import { EMPTY_TOPIC } from '@/knowledgebase/topics/components/TopicFormFields';

const mockClose = jest.fn();
jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'user-1' }),
  useSidePanel: () => ({
    record: {
      contentType: 'frontline:knowledgebase.article',
      contentId: 'other',
    },
    close: mockClose,
  }),
}));
jest.mock('@/knowledgebase/topics/components/TopicFormFields', () => ({
  EMPTY_TOPIC: { title: '', color: '#fff' },
}));
jest.mock('erxes-ui', () => ({
  useConfirm: () => ({ confirm: jest.fn() }),
  isDeeplyEqual: jest.requireActual<typeof import('deep-equal')>('deep-equal'),
}));
const article: TArticleForm = {
  title: 'Draft',
  content: 'Body',
  topicId: 'topic-1',
  categoryId: 'category-1',
  status: 'draft',
  isPrivate: false,
  reactionChoices: [],
  attachments: [],
};
const category: TCategoryForm = {
  title: 'Category',
  icon: 'book',
  topicId: 'topic-1',
};

const setup = (contentType: string) => {
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  store.set(articlePanelDraftsState, {
    '["user-1","article","article-1"]': {
      values: article,
      defaultValues: article,
    },
    '["user-1","article","other"]': {
      values: {
        ...article,
        topicId: 'other-topic',
        categoryId: 'other-category',
      },
      defaultValues: {
        ...article,
        topicId: 'other-topic',
        categoryId: 'other-category',
      },
    },
  });
  store.set(categoryPanelDraftsState, {
    '["user-1","category","category-1"]': {
      values: category,
      defaultValues: category,
    },
  });
  store.set(topicPanelDraftsState, {
    '["user-1","topic","topic-1"]': {
      values: EMPTY_TOPIC,
      defaultValues: EMPTY_TOPIC,
    },
  });
  const hook = renderHook(() => useKbCloseRemovedRecord(contentType), {
    wrapper,
  });
  return { ...hook, store };
};

it('clears a deleted article draft without closing the currently selected other record', () => {
  const { result, store } = setup('frontline:knowledgebase.article');
  act(() => result.current('article-1'));
  expect(Object.keys(store.get(articlePanelDraftsState))).toEqual([
    '["user-1","article","other"]',
  ]);
  expect(mockClose).not.toHaveBeenCalled();
});

it('clears a removed category and drafts placed in that category', () => {
  const { result, store } = setup('frontline:knowledgebase.category');
  act(() => result.current('category-1'));
  expect(store.get(categoryPanelDraftsState)).toEqual({});
  expect(Object.keys(store.get(articlePanelDraftsState))).toEqual([
    '["user-1","article","other"]',
  ]);
});

it('clears a removed topic and its category/article drafts even after the initiating row unmounted', () => {
  const { result, store, unmount } = setup('frontline:knowledgebase.topic');
  const removed = result.current;
  unmount();
  act(() => removed('topic-1'));
  expect(store.get(topicPanelDraftsState)).toEqual({});
  expect(store.get(categoryPanelDraftsState)).toEqual({});
  expect(Object.keys(store.get(articlePanelDraftsState))).toEqual([
    '["user-1","article","other"]',
  ]);
});

const exerciseRetainedCreateDeletion = async <
  T extends FieldValues & { title: string },
>(
  kind: 'article' | 'category' | 'topic',
  values: T,
  draftsState: PrimitiveAtom<TPanelFormDrafts<T>>,
  mounted: boolean,
): Promise<void> => {
  const store = createStore();
  const onDeleted = jest.fn();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const mount = (context = ['placement-1']) =>
    renderHook(
      () => {
        const form = useForm<T>();
        const draft = useKbPanelFormDraft({
          form,
          kind,
          context,
          values,
          draftsState,
          discardMessage: 'Discard?',
          onDeleted,
        });
        return { form, ...draft };
      },
      { wrapper },
    );
  const unrelatedKey = kbPanelDraftKey('user-1', kind, 'unrelated');
  const unrelated = { ...values, title: 'Unrelated draft' };
  store.set(draftsState, {
    [unrelatedKey]: { values: unrelated, defaultValues: values },
  });
  const editor = mount();
  const submitted = { ...values, title: 'Submitted title' };
  act(() => editor.result.current.form.reset(submitted));
  let finish: (id: string) => void = () => undefined;
  let save: Promise<string | null> = Promise.resolve(null);
  act(() => {
    save = editor.result.current.save(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  });
  act(() =>
    editor.result.current.form.reset(
      { ...values, title: 'Newer title' },
      { keepDefaultValues: true },
    ),
  );
  await act(async () => {
    finish('created-1');
    expect(await save).toBe('created-1');
    expect(editor.result.current.markSaved(submitted)).toBe(false);
  });
  const createKey = kbPanelDraftKey('user-1', kind, undefined, ['placement-1']);
  expect(store.get(draftsState)[createKey]?.values.title).toBe('Newer title');
  expect(store.get(kbPanelSavesState)[createKey]?.createdId).toBe('created-1');
  if (!mounted) editor.unmount();
  const removal = renderHook(
    () => useKbCloseRemovedRecord(`frontline:knowledgebase.${kind}`),
    { wrapper },
  );
  act(() => removal.result.current('created-1'));
  expect(store.get(draftsState)[createKey]).toBeUndefined();
  expect(store.get(kbPanelSavesState)[createKey]).toBeUndefined();
  expect(store.get(draftsState)[unrelatedKey]?.values.title).toBe(
    'Unrelated draft',
  );
  if (mounted) {
    expect(editor.result.current.form.getValues().title).toBe(values.title);
    const recreate = jest.fn(() => Promise.resolve('duplicate'));
    await act(async () => {
      expect(await editor.result.current.save(recreate)).toBeNull();
    });
    expect(recreate).not.toHaveBeenCalled();
    expect(onDeleted).toHaveBeenCalledTimes(1);
    act(() =>
      editor.result.current.form.reset(
        { ...values, title: 'Stale mounted input' },
        { keepDefaultValues: true },
      ),
    );
    expect(store.get(draftsState)[createKey]).toBeUndefined();
    editor.unmount();
  }
  const reopened = mount();
  expect(reopened.result.current.form.getValues().title).toBe(values.title);
  expect(store.get(draftsState)[unrelatedKey]?.values.title).toBe(
    'Unrelated draft',
  );
};

it.each([false, true])(
  'clears a retained article create draft after deletion (mounted: %s)',
  (mounted) =>
    exerciseRetainedCreateDeletion(
      'article',
      { ...article, title: '' },
      articlePanelDraftsState,
      mounted,
    ),
);
it.each([false, true])(
  'clears a retained category create draft after deletion (mounted: %s)',
  (mounted) =>
    exerciseRetainedCreateDeletion(
      'category',
      { ...category, title: '' },
      categoryPanelDraftsState,
      mounted,
    ),
);
it.each([false, true])(
  'clears a retained topic create draft after deletion (mounted: %s)',
  (mounted) =>
    exerciseRetainedCreateDeletion(
      'topic',
      EMPTY_TOPIC,
      topicPanelDraftsState,
      mounted,
    ),
);
