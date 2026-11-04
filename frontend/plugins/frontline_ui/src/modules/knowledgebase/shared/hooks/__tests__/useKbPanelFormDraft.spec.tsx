import type { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider } from 'jotai';
import { useForm } from 'react-hook-form';
import { useKbPanelFormDraft } from '../useKbPanelFormDraft';
import {
  articlePanelDraftsState,
  categoryPanelDraftsState,
  topicPanelDraftsState,
  kbPanelSavesState,
} from '../../states/panelFormDraftsState';
import { currentUserState } from 'ui-modules';

jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom<{ _id: string } | null>({ _id: 'user-1' }),
}));
jest.mock('erxes-ui', () => ({
  useConfirm: () => ({ confirm: () => new Promise<void>(() => undefined) }),
  isDeeplyEqual: jest.requireActual<typeof import('deep-equal')>('deep-equal'),
}));

const setup = () => {
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const values = { title: '', topicId: 'topic-1' };
  const draftsState = atom({});
  const mount = (context = ['topic-1'], recordId?: string) =>
    renderHook(
      ({ scope }) => {
        const form = useForm({ defaultValues: values });
        const draft = useKbPanelFormDraft({
          form,
          kind: 'article',
          recordId,
          context: scope,
          draftsState,
          values,
          discardMessage: 'Discard?',
        });
        return { form, ...draft };
      },
      { wrapper, initialProps: { scope: context } },
    );
  return { store, mount };
};

it('isolates cached drafts by user and create placement', () => {
  const { store, mount } = setup();
  const first = mount();
  act(() =>
    first.result.current.form.setValue('title', 'First placement', {
      shouldDirty: true,
    }),
  );
  first.unmount();
  const otherPlacement = mount(['topic-2']);
  expect(otherPlacement.result.current.form.getValues('title')).toBe('');
  otherPlacement.unmount();
  const returned = mount();
  expect(returned.result.current.form.getValues('title')).toBe(
    'First placement',
  );
  returned.unmount();
  act(() => store.set(currentUserState, { _id: 'user-2', isOnboarded: true }));
  const otherUser = mount();
  expect(otherUser.result.current.form.getValues('title')).toBe('');
});

it('clears all KB draft kinds on logout even after their editor unmounts', () => {
  const { store, mount } = setup();
  const editor = mount();
  editor.unmount();
  act(() => {
    const article = {
      title: 'private',
      content: 'body',
      topicId: 'topic-1',
      categoryId: 'category-1',
      status: 'draft',
      isPrivate: false,
      reactionChoices: [],
      attachments: [],
    };
    const category = { title: 'private', icon: 'book', topicId: 'topic-1' };
    const topic = { title: 'private', color: '#fff' };
    store.set(articlePanelDraftsState, {
      old: { values: article, defaultValues: article },
    });
    store.set(categoryPanelDraftsState, {
      old: { values: category, defaultValues: category },
    });
    store.set(topicPanelDraftsState, {
      old: { values: topic, defaultValues: topic },
    });
    store.set(currentUserState, null);
  });
  expect(store.get(articlePanelDraftsState)).toEqual({});
  expect(store.get(categoryPanelDraftsState)).toEqual({});
  expect(store.get(topicPanelDraftsState)).toEqual({});
});

it('shares a pending create across reopening and uses its saved id for later edits', async () => {
  const { mount } = setup();
  const first = mount();
  let finish: (id: string) => void = () => undefined;
  let pending: Promise<string | null> = Promise.resolve(null);
  const create = jest.fn(
    () =>
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
  );
  act(() => {
    pending = first.result.current.save(create);
  });
  first.unmount();
  const reopened = mount();
  const duplicate = jest.fn(() => Promise.resolve('duplicate'));
  await act(async () => {
    await reopened.result.current.save(duplicate);
  });
  expect(duplicate).not.toHaveBeenCalled();
  expect(reopened.result.current.saving).toBe(true);
  await act(async () => {
    finish('created-1');
    await pending;
  });
  const edit = jest.fn(() => Promise.resolve('created-1'));
  await act(async () => {
    await reopened.result.current.save(edit);
  });
  expect(edit).toHaveBeenCalledWith('created-1');
});

it('does not let a save completing after logout restore private drafts', async () => {
  const { store, mount } = setup();
  const editor = mount();
  let finish: (id: string) => void = () => undefined;
  let pending: Promise<string | null> = Promise.resolve(null);
  act(() => {
    pending = editor.result.current.save(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  });
  act(() => store.set(currentUserState, null));
  await act(async () => {
    finish('created-1');
    expect(await pending).toBeNull();
  });
});

it('does not acknowledge a save whose scope was deleted while it was pending', async () => {
  const { store, mount } = setup();
  const editor = mount();
  let finish: (id: string) => void = () => undefined;
  let pending: Promise<string | null> = Promise.resolve(null);
  act(() => {
    pending = editor.result.current.save(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  });
  act(() => store.set(kbPanelSavesState, {}));
  await act(async () => {
    finish('created-1');
    expect(await pending).toBeNull();
  });
  expect(store.get(kbPanelSavesState)).toEqual({});
});
