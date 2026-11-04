import type { PropsWithChildren } from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { atom, createStore, Provider } from 'jotai';
import { type Resolver, type UseFormReturn, useForm } from 'react-hook-form';
import { usePanelFormDraft, type TPanelFormDrafts } from '../usePanelFormDraft';

const mockConfirm = jest.fn<Promise<void>, [unknown]>();
jest.mock('erxes-ui', () => ({
  useConfirm: () => ({ confirm: mockConfirm }),
  isDeeplyEqual: jest.requireActual<typeof import('deep-equal')>('deep-equal'),
}));

type Values = { title: string; topicId: string };
const serverValues = { title: 'Saved title', topicId: 'topic-1' };

const changeTitle = (form: UseFormReturn<Values>, title: string): void => {
  act(() => form.setValue('title', title, { shouldDirty: true }));
};

const setup = (isNew = false, resolver?: Resolver<Values>) => {
  const draftsState = atom<TPanelFormDrafts<Values>>({});
  const store = createStore();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const useEditor = ({ id, values }: { id: string; values: Values }) => {
    const form = useForm<Values>({ defaultValues: values, resolver });
    const draft = usePanelFormDraft({
      form,
      recordKey: id,
      values,
      draftsState,
      isNew,
    });
    return { form, ...draft };
  };
  const mount = (id = 'record-1', values = serverValues) =>
    renderHook(useEditor, { wrapper, initialProps: { id, values } });
  const reopenDuringSave = (submitted: Values) => {
    const first = mount();
    changeTitle(first.result.current.form, submitted.title);
    const finish = first.result.current.markSaved;
    first.unmount();
    return { finish, reopened: mount() };
  };
  return { mount, store, draftsState, reopenDuringSave };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockConfirm.mockImplementation(() => new Promise<void>(() => undefined));
});

it('restores a dirty form after Activity unmounts and remounts the editor', () => {
  const { mount } = setup();
  const first = mount();
  changeTitle(first.result.current.form, 'Unfinished article');
  first.unmount();
  const second = mount();
  expect(second.result.current.form.getValues('title')).toBe(
    'Unfinished article',
  );
});

it('keeps edits isolated when another record opens and the original returns', () => {
  const { mount } = setup();
  const editor = mount();
  changeTitle(editor.result.current.form, 'First draft');
  editor.rerender({
    id: 'record-2',
    values: { title: 'Second saved', topicId: 'topic-2' },
  });
  expect(editor.result.current.form.getValues('title')).toBe('Second saved');
  editor.rerender({ id: 'record-1', values: serverValues });
  expect(editor.result.current.form.getValues('title')).toBe('First draft');
});

it('does not overwrite user input when a background query updates', () => {
  const { mount } = setup();
  const editor = mount();
  changeTitle(editor.result.current.form, 'User edit');
  editor.rerender({
    id: 'record-1',
    values: { title: 'Background update', topicId: 'topic-1' },
  });
  expect(editor.result.current.form.getValues('title')).toBe('User edit');
  expect(mockConfirm).not.toHaveBeenCalled();
});

it('updates a pristine form from fresh server data', () => {
  const { mount } = setup();
  const editor = mount();
  editor.rerender({
    id: 'record-1',
    values: { title: 'Fresh saved title', topicId: 'topic-1' },
  });
  expect(editor.result.current.form.getValues('title')).toBe(
    'Fresh saved title',
  );
});

it('clears cached input on Cancel or successful save', () => {
  const { mount, store, draftsState } = setup();
  const editor = mount();
  changeTitle(editor.result.current.form, 'Discarded');
  act(() => editor.result.current.clearDraft());
  editor.unmount();
  expect(store.get(draftsState)).toEqual({});
  const reopened = mount();
  expect(reopened.result.current.form.getValues('title')).toBe('Saved title');
});

it.each([false, true])(
  'keeps dirty new-draft values when replacement is dismissed (remount: %s)',
  (remount) => {
    const { mount } = setup(true);
    let editor = mount('new', { title: '', topicId: 'topic-1' });
    changeTitle(editor.result.current.form, 'Current draft');
    const values = { title: '', topicId: 'topic-2' };
    if (remount) {
      editor.unmount();
      editor = mount('new', values);
    } else {
      editor.rerender({ id: 'new', values });
    }
    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(editor.result.current.form.getValues()).toEqual({
      title: 'Current draft',
      topicId: 'topic-1',
    });
  },
);

it.each([false, true])(
  'replaces a dirty new draft only after confirmation (remount: %s)',
  async (remount) => {
    let approve: () => void = () => undefined;
    mockConfirm.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          approve = resolve;
        }),
    );
    const { mount } = setup(true);
    let editor = mount('new', { title: '', topicId: 'topic-1' });
    changeTitle(editor.result.current.form, 'Discard me');
    const values = { title: '', topicId: 'topic-2' };
    if (remount) {
      editor.unmount();
      editor = mount('new', values);
    } else {
      editor.rerender({ id: 'new', values });
    }
    await act(() => Promise.resolve(approve()));
    expect(editor.result.current.form.getValues()).toEqual({
      title: '',
      topicId: 'topic-2',
    });
  },
);

it('keeps a newly active record writable when an earlier save clears its draft', () => {
  const { mount, store, draftsState } = setup();
  const editor = mount();
  const finishEarlierSave = editor.result.current.clearDraft;
  editor.rerender({ id: 'record-2', values: serverValues });
  act(() => finishEarlierSave());
  changeTitle(editor.result.current.form, 'Second draft');
  expect(store.get(draftsState)['record-2']?.values.title).toBe('Second draft');
});

it('restores the visible value of registered inputs as well as form state', () => {
  const draftsState = atom<TPanelFormDrafts<Values>>({});
  const store = createStore();
  const Editor = () => {
    const form = useForm<Values>({ defaultValues: serverValues });
    usePanelFormDraft({
      form,
      recordKey: 'record-1',
      values: serverValues,
      draftsState,
    });
    return <input aria-label="Title" {...form.register('title')} />;
  };
  const mount = () =>
    render(
      <Provider store={store}>
        <Editor />
      </Provider>,
    );
  const first = mount();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Visible draft' },
  });
  first.unmount();
  mount();
  expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe(
    'Visible draft',
  );
});

it('persists further edits after an in-place save establishes a new baseline', () => {
  const { mount } = setup();
  const editor = mount();
  const saved = { title: 'Saved update', topicId: 'topic-1' };
  changeTitle(editor.result.current.form, saved.title);
  act(() => editor.result.current.markSaved(saved));
  expect(editor.result.current.form.getValues('title')).toBe('Saved update');
  changeTitle(editor.result.current.form, 'Another edit');
  editor.unmount();
  const reopened = mount('record-1', saved);
  expect(reopened.result.current.form.getValues('title')).toBe('Another edit');
});

it('keeps newer same-record edits when an earlier unmounted save completes', () => {
  const { reopenDuringSave, store, draftsState } = setup();
  const submitted = { title: 'Submitted', topicId: 'topic-1' };
  const { finish, reopened } = reopenDuringSave(submitted);
  changeTitle(reopened.result.current.form, 'Newer edit');
  act(() => expect(finish(submitted)).toBe(false));
  expect(store.get(draftsState)['record-1']?.values.title).toBe('Newer edit');
});

it('persists edits back to the original value after saving with newer input', () => {
  const { mount, store, draftsState } = setup();
  const editor = mount();
  const submitted = { title: 'Submitted title', topicId: 'topic-1' };
  changeTitle(editor.result.current.form, submitted.title);
  changeTitle(editor.result.current.form, 'Newer title');
  act(() => expect(editor.result.current.markSaved(submitted)).toBe(false));
  expect(editor.result.current.form.getValues('title')).toBe('Newer title');
  changeTitle(editor.result.current.form, serverValues.title);
  expect(store.get(draftsState)['record-1']?.values.title).toBe('Saved title');
  editor.unmount();
  const reopened = mount('record-1', submitted);
  expect(reopened.result.current.form.getValues('title')).toBe('Saved title');
});

it('advances the reopened form baseline when its earlier save completes', () => {
  const { mount, store, draftsState, reopenDuringSave } = setup();
  const submitted = { title: 'Submitted title', topicId: 'topic-1' };
  const { finish, reopened } = reopenDuringSave(submitted);
  act(() => expect(finish(submitted)).toBe(true));
  expect(store.get(draftsState)).toEqual({});
  expect(reopened.result.current.form.formState.isDirty).toBe(false);
  changeTitle(reopened.result.current.form, serverValues.title);
  reopened.unmount();
  const returned = mount('record-1', submitted);
  expect(returned.result.current.form.getValues('title')).toBe('Saved title');
});

it('preserves a reopened edit back to the original value before save completes', () => {
  const { mount, store, draftsState, reopenDuringSave } = setup();
  const submitted = { title: 'Submitted title', topicId: 'topic-1' };
  const { finish, reopened } = reopenDuringSave(submitted);
  changeTitle(reopened.result.current.form, serverValues.title);
  act(() => expect(finish(submitted)).toBe(false));
  expect(reopened.result.current.form.getValues('title')).toBe('Saved title');
  expect(store.get(draftsState)['record-1']?.values.title).toBe('Saved title');
  reopened.unmount();
  const returned = mount('record-1', submitted);
  expect(returned.result.current.form.getValues('title')).toBe('Saved title');
});

it('matches raw submitted values while establishing the normalized baseline', async () => {
  const resolver: Resolver<Values> = (values) =>
    Promise.resolve({
      values: { ...values, title: values.title.trim() },
      errors: {},
    });
  const { mount, store, draftsState } = setup(false, resolver);
  const editor = mount();
  changeTitle(editor.result.current.form, '  Submitted title  ');
  await act(async () => {
    await editor.result.current.form.handleSubmit((savedValues) => {
      const submittedValues = { ...editor.result.current.form.getValues() };
      expect(savedValues.title).toBe('Submitted title');
      expect(
        editor.result.current.markSaved(savedValues, submittedValues),
      ).toBe(true);
    })();
  });
  expect(store.get(draftsState)).toEqual({});
  expect(editor.result.current.form.getValues('title')).toBe('Submitted title');
  expect(editor.result.current.form.formState.isDirty).toBe(false);
});

it('matches submitted values independently of property order', () => {
  const { mount, store, draftsState } = setup();
  const editor = mount();
  changeTitle(editor.result.current.form, 'Submitted title');
  act(() =>
    expect(
      editor.result.current.markSaved({
        topicId: 'topic-1',
        title: 'Submitted title',
      }),
    ).toBe(true),
  );
  expect(store.get(draftsState)).toEqual({});
});

it('merges a captured upload into the latest remounted draft', () => {
  const { mount } = setup();
  const first = mount();
  let finish: (update: (latest: Values) => Values) => void = () => undefined;
  act(() => {
    finish = first.result.current.captureUpdate();
  });
  first.unmount();
  const reopened = mount();
  changeTitle(reopened.result.current.form, 'Newer title');
  act(() => finish((latest) => ({ ...latest, topicId: 'uploaded-file' })));
  expect(reopened.result.current.form.getValues()).toEqual({
    title: 'Newer title',
    topicId: 'uploaded-file',
  });
  reopened.unmount();
  const restored = mount();
  expect(restored.result.current.form.getValues('topicId')).toBe(
    'uploaded-file',
  );
});

it('retains an upload completed while Activity has no mounted editor', () => {
  const { mount } = setup();
  const editor = mount();
  let finish: (update: (latest: Values) => Values) => void = () => undefined;
  act(() => {
    finish = editor.result.current.captureUpdate();
  });
  editor.unmount();
  act(() => finish((latest) => ({ ...latest, title: 'Uploaded' })));
  const reopened = mount();
  expect(reopened.result.current.form.getValues('title')).toBe('Uploaded');
});

it.each(['discard', 'external clear'] as const)(
  'does not resurrect a captured upload after %s and a new draft opens',
  (action) => {
    const { mount, store, draftsState } = setup();
    const first = mount();
    let finish: (update: (latest: Values) => Values) => void = () => undefined;
    act(() => {
      finish = first.result.current.captureUpdate();
    });
    first.unmount();
    const reopened = mount();
    act(() => {
      if (action === 'discard') reopened.result.current.clearDraft();
      else store.set(draftsState, {});
    });
    reopened.unmount();
    const next = mount();
    changeTitle(next.result.current.form, 'Replacement draft');
    act(() => finish((latest) => ({ ...latest, topicId: 'obsolete-upload' })));
    expect(next.result.current.form.getValues()).toEqual({
      title: 'Replacement draft',
      topicId: 'topic-1',
    });
  },
);

it('acknowledges Save normally and retains a later upload for the saved draft', () => {
  const { mount } = setup();
  const editor = mount();
  changeTitle(editor.result.current.form, 'Saved new title');
  let finish: (update: (latest: Values) => Values) => void = () => undefined;
  act(() => {
    finish = editor.result.current.captureUpdate();
  });
  let clean = false;
  act(() => {
    clean = editor.result.current.markSaved(
      editor.result.current.form.getValues(),
    );
  });
  expect(clean).toBe(true);
  editor.unmount();
  act(() => finish((latest) => ({ ...latest, topicId: 'late-file' })));
  const reopened = mount('record-1', {
    title: 'Saved new title',
    topicId: 'topic-1',
  });
  expect(reopened.result.current.form.getValues()).toEqual({
    title: 'Saved new title',
    topicId: 'late-file',
  });
});

it('allows retry and Save when an oversized or failed upload emits no callback', () => {
  const { mount } = setup();
  const editor = mount();
  act(() => {
    editor.result.current.captureUpdate();
  });
  let clean = false;
  act(() => {
    clean = editor.result.current.markSaved(serverValues);
  });
  expect(clean).toBe(true);
  let retry: (update: (latest: Values) => Values) => void = () => undefined;
  act(() => {
    retry = editor.result.current.captureUpdate();
  });
  act(() => retry((latest) => ({ ...latest, title: 'Retry completed' })));
  expect(editor.result.current.form.getValues('title')).toBe('Retry completed');
  act(() => editor.result.current.clearDraft());
  editor.unmount();
  expect(mount().result.current.form.getValues()).toEqual(serverValues);
});

it('cancels an old field upload when that field is removed after remount', () => {
  const { mount } = setup();
  const first = mount();
  let finish: (update: (latest: Values) => Values) => void = () => undefined;
  act(() => {
    finish = first.result.current.captureUpdate('title');
  });
  first.unmount();
  const reopened = mount();
  act(() => {
    reopened.result.current.invalidateUpdates('title');
    reopened.result.current.form.setValue('title', '', { shouldDirty: true });
  });
  act(() => finish((latest) => ({ ...latest, title: 'Obsolete upload' })));
  expect(reopened.result.current.form.getValues('title')).toBe('');
});

it('keeps the newest scalar selection while another field upload still completes', () => {
  const { mount } = setup();
  const editor = mount();
  let first: (update: (latest: Values) => Values) => void = () => undefined;
  let second: typeof first = () => undefined;
  let other: typeof first = () => undefined;
  act(() => {
    first = editor.result.current.captureUpdate('title');
    other = editor.result.current.captureUpdate('topicId');
    second = editor.result.current.captureUpdate('title');
  });
  act(() => second((latest) => ({ ...latest, title: 'Latest upload' })));
  act(() => first((latest) => ({ ...latest, title: 'Old upload' })));
  act(() => other((latest) => ({ ...latest, topicId: 'Independent upload' })));
  expect(editor.result.current.form.getValues()).toEqual({
    title: 'Latest upload',
    topicId: 'Independent upload',
  });
});

it('keeps saves scoped across remounts and ignores an older completion token', () => {
  const session = setup();
  const first = session.mount();
  let firstId: number | undefined;
  act(() => {
    firstId = first.result.current.beginSave();
  });
  expect(firstId).toBeDefined();
  if (firstId === undefined) throw new Error('Expected first save token');
  const token = firstId;
  const finishFirst = first.result.current.endSave;
  first.unmount();
  const reopened = session.mount();
  expect(reopened.result.current.saving).toBe(true);
  let duplicateId: number | undefined;
  act(() => {
    duplicateId = reopened.result.current.beginSave();
  });
  expect(duplicateId).toBeUndefined();
  const other = session.mount('record-2');
  act(() => {
    other.result.current.beginSave();
  });
  expect(other.result.current.saving).toBe(true);
  expect(setup().mount().result.current.saving).toBe(false);
  act(() => finishFirst(token));
  expect(reopened.result.current.saving).toBe(false);
  expect(other.result.current.saving).toBe(true);
  act(() => {
    reopened.result.current.beginSave();
  });
  act(() => finishFirst(token));
  expect(reopened.result.current.saving).toBe(true);
});

describe('draft collection isolation', () => {
  type TValues = { name: string };
  const defaultValues = { name: 'Saved name' };

  const setup = () => {
    const store = createStore();
    const draftsState = atom<TPanelFormDrafts<TValues>>({});
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );
    const mount = () =>
      renderHook(
        () => {
          const form = useForm<TValues>({ defaultValues });
          const draft = usePanelFormDraft({
            form,
            recordKey: 'user:record',
            values: defaultValues,
            draftsState,
          });
          return { form, ...draft };
        },
        { wrapper },
      );
    return { store, draftsState, mount };
  };

  it.each(['clear', 'revert'])(
    'removes only the active draft after %s without mutating other cached drafts',
    (action) => {
      const { store, draftsState, mount } = setup();
      const { result } = mount();
      act(() =>
        result.current.form.setValue('name', 'Unsaved name', {
          shouldDirty: true,
        }),
      );
      const other = {
        values: { name: 'Other edits' },
        defaultValues: { name: 'Other saved' },
      };
      act(() => store.set(draftsState, (previous) => ({ ...previous, other })));
      const previous = store.get(draftsState);
      act(() => {
        if (action === 'clear') result.current.clearDraft();
        else
          result.current.form.setValue('name', 'Saved name', {
            shouldDirty: true,
          });
      });
      expect(store.get(draftsState)).toEqual({ other });
      expect(store.get(draftsState).other).toBe(other);
      expect(previous['user:record']?.values.name).toBe('Unsaved name');
    },
  );

  it('acknowledges an offscreen save without overwriting newer edits restored by another form', () => {
    const { store, draftsState, mount } = setup();
    const original = mount();
    act(() =>
      original.result.current.form.setValue('name', 'Submitted name', {
        shouldDirty: true,
      }),
    );
    const acknowledge = original.result.current.markSaved;
    original.unmount();
    const reopened = mount();
    expect(reopened.result.current.form.getValues('name')).toBe(
      'Submitted name',
    );
    act(() =>
      reopened.result.current.form.setValue('name', 'Newer edits', {
        shouldDirty: true,
      }),
    );
    act(() => {
      expect(acknowledge({ name: 'Submitted name' })).toBe(false);
    });
    expect(reopened.result.current.form.getValues('name')).toBe('Newer edits');
    expect(store.get(draftsState)['user:record']).toEqual({
      values: { name: 'Newer edits' },
      defaultValues: { name: 'Submitted name' },
    });
  });
});
