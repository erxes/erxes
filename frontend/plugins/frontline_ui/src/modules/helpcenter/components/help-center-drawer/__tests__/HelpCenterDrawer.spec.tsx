import type { PropsWithChildren } from 'react';
import type { ApolloCache } from '@apollo/client';
import {
  act,
  createEvent,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { UseFormReturn } from 'react-hook-form';
import type { IHelpCenter, IHelpCenterConfigInput } from '@/helpcenter/types';
import { HelpCenterDrawer } from '../HelpCenterDrawer';
import type { TCaptureHelpCenterImage } from '../HelpCenterStyleFields';
import { currentUserState } from 'ui-modules';
import { HelpCenterRecordPanel } from '~/widgets/record-panel/HelpCenterRecordPanel';
import { preventImplicitSubmit as mockPreventImplicitSubmit } from '@/helpcenter/utils/preventImplicitSubmit';
import { EMPTY_HELP_CENTER_FORM } from '@/helpcenter/constants';
import { useRemoveHelpCenters } from '@/helpcenter/hooks/useRemoveHelpCenters';
import {
  helpCenterPanelCreatedState,
  helpCenterPanelDraftsState,
} from '@/helpcenter/states/helpCenterPanelDraftsState';

const mockConfirm = jest.fn<Promise<void>, [unknown]>();
const mockSave = jest.fn();
const mockRemove = jest.fn();
const mockRefetch = jest.fn();
const mockRead = jest.fn();
const mockToast = jest.fn();
let mockLoading = false;
let mockRecordId = 'help-1';
const mockClose = jest.fn();
const mockBack = jest.fn();
let mockFinishUpload: () => void = () => undefined;

jest.mock('erxes-ui', () => {
  const { FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Form: FormProvider,
    toast: (input: unknown) => mockToast(input),
    useToast: () => ({ toast: mockToast }),
    Tabs: Object.assign(Container, { List: Container, Trigger: Container }),
    isDefined: (value: unknown) => value != null,
    isDeeplyEqual:
      jest.requireActual<typeof import('deep-equal')>('deep-equal'),
    useConfirm: () => ({ confirm: mockConfirm }),
  };
});
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ refetchQueries: mockRefetch, query: mockRead }),
  useMutation: () => [mockRemove, { loading: false }],
}));
jest.mock('@/helpcenter/graphql/mutations/helpCenterConfigUpdate', () => ({
  HELP_CENTER_CONFIG_REMOVE: {},
}));
jest.mock('@/helpcenter/graphql/queries/getHelpCenters', () => ({
  GET_HELP_CENTERS: {},
  GET_HELP_CENTER: {},
}));
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({
    record: { contentType: 'frontline:helpcenter', contentId: mockRecordId },
    close: mockClose,
    back: mockBack,
    canGoBack: true,
  }),
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'user-1' }),
  PanelFormLayout: ({
    children,
    onCancel,
    saving,
  }: PropsWithChildren<{ onCancel: () => void; saving?: boolean }>) => (
    <div>
      {children}
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" disabled={saving}>
        Save
      </button>
    </div>
  ),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
jest.mock('@/helpcenter/hooks/useHelpCenters', () => ({
  useHelpCenterDetail: () => ({
    helpCenter: { _id: mockRecordId, title: 'Title' },
    loading: false,
  }),
}));
jest.mock('@/helpcenter/hooks/useSaveHelpCenter', () => ({
  useSaveHelpCenter: ({ onSaved }: { onSaved?: () => void } = {}) => ({
    saveHelpCenter: async (config: IHelpCenterConfigInput) => {
      const result = await mockSave(config);
      if (result?.data?.helpCenterConfigUpdate) onSaved?.();
      return result;
    },
    loading: mockLoading,
  }),
}));
jest.mock('../HelpCenterGeneralTab', () => ({
  HelpCenterGeneralTab: ({
    form,
  }: {
    form: UseFormReturn<IHelpCenterConfigInput>;
  }) => (
    <>
      <input
        onKeyDown={mockPreventImplicitSubmit}
        aria-label="Title"
        {...form.register('title', { required: true })}
      />
      <textarea aria-label="Description" {...form.register('description')} />
    </>
  ),
}));
jest.mock('../HelpCenterAppearanceTab', () => ({
  HelpCenterAppearanceTab: ({
    form,
    captureImageUpdate,
    invalidateImageUpdate,
  }: {
    form: UseFormReturn<IHelpCenterConfigInput>;
    captureImageUpdate?: TCaptureHelpCenterImage;
    invalidateImageUpdate?: (name: 'styles.mainLogo') => void;
  }) => {
    const { useController } =
      jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
    const { field } = useController({
      control: form.control,
      name: 'styles.mainLogo',
    });
    return (
      <>
        <input
          onKeyDown={mockPreventImplicitSubmit}
          aria-label="Main logo"
          value={field.value ?? ''}
          onChange={field.onChange}
        />
        <button
          type="button"
          onClick={() => {
            const complete =
              captureImageUpdate?.('styles.mainLogo') ?? field.onChange;
            mockFinishUpload = () => complete('https://files/logo.png');
          }}
        >
          Start logo upload
        </button>
        <button
          type="button"
          onClick={() => {
            invalidateImageUpdate?.('styles.mainLogo');
            field.onChange('');
          }}
        >
          Remove logo
        </button>
      </>
    );
  },
}));
jest.mock('../HelpCenterDomainTab', () => ({
  HelpCenterDomainTab: () => null,
}));
jest.mock('@/knowledgebase/shared/components/TopicEmbedTab', () => ({
  TopicEmbedTab: () => null,
}));

const saved: IHelpCenter = {
  ...EMPTY_HELP_CENTER_FORM,
  _id: 'help-1',
  title: 'Saved title',
  description: 'Saved description',
  styles: null,
  header: null,
  footer: null,
  createdAt: null,
  brand: null,
};

const save = () => {
  const button = screen.getByRole('button', { name: 'Save' });
  const form = button.closest('form');
  if (!form) throw new Error('Expected a containing form');
  const event = createEvent.submit(form);
  Object.defineProperty(event, 'submitter', { value: button });
  fireEvent(form, event);
};

const setup = () => {
  const store = createStore();
  const onClose = jest.fn();
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const open = (helpCenter: IHelpCenter = saved) =>
    render(<HelpCenterDrawer helpCenter={helpCenter} onClose={onClose} />, {
      wrapper,
    });
  const openNew = () =>
    render(<HelpCenterDrawer onClose={onClose} />, { wrapper });
  return { open, openNew, wrapper, onClose, store };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLoading = false;
  mockRecordId = 'help-1';
  mockFinishUpload = () => undefined;
  mockConfirm.mockImplementation(() => new Promise<void>(() => undefined));
  mockSave.mockResolvedValue({ data: { helpCenterConfigUpdate: saved } });
  mockRead.mockResolvedValue({
    data: {
      helpCenterConfig: {
        ...saved,
        _id: 'created-1',
        title: 'Create with logo',
        description: '',
      },
    },
  });
});

it('prevents Enter from submitting a single-line setting', () => {
  setup().open();
  const event = createEvent.keyDown(screen.getByLabelText('Title'), {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  });
  fireEvent(screen.getByLabelText('Title'), event);
  expect(event.defaultPrevented).toBe(true);
  expect(mockSave).not.toHaveBeenCalled();
});

it('preserves multiline newlines and input composition', () => {
  setup().open();
  const textarea = screen.getByLabelText('Description');
  const newline = createEvent.keyDown(textarea, {
    key: 'Enter',
    bubbles: true,
    cancelable: true,
  });
  fireEvent(textarea, newline);
  expect(newline.defaultPrevented).toBe(false);
  const title = screen.getByLabelText('Title');
  const composition = createEvent.keyDown(title, {
    key: 'Enter',
    isComposing: true,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(title, composition);
  expect(composition.defaultPrevented).toBe(false);
});

it('does not reset active typing when the same record changes in the background', () => {
  const { open, wrapper, onClose } = setup();
  const editor = open();
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Unfinished settings' },
  });
  editor.rerender(
    <HelpCenterDrawer
      helpCenter={{ ...saved, title: 'Inline rename' }}
      onClose={onClose}
    />,
  );
  expect(
    (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
  ).toBe('Unfinished settings');
  editor.unmount();
  render(
    <HelpCenterDrawer
      helpCenter={{ ...saved, _id: 'help-2', title: 'Second record' }}
      onClose={onClose}
    />,
    { wrapper },
  );
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Second record',
  );
});

it('restores unsaved settings after switching to Activity or another row', () => {
  const { open } = setup();
  const editor = open();
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Keep my draft' },
  });
  editor.unmount();
  const other = open({ ...saved, _id: 'help-2', title: 'Other Help Center' });
  expect(
    (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
  ).toBe('Saved description');
  other.unmount();
  open();
  expect(
    (screen.getByLabelText('Description') as HTMLTextAreaElement).value,
  ).toBe('Keep my draft');
});

it('requires an affirmative discard before Cancel loses dirty settings', async () => {
  let discard: () => void = () => undefined;
  mockConfirm.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        discard = resolve;
      }),
  );
  const { open, onClose } = setup();
  const editor = open();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Draft title' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
  expect(onClose).not.toHaveBeenCalled();
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Draft title',
  );
  await act(() => Promise.resolve(discard()));
  expect(onClose).toHaveBeenCalledTimes(1);
  editor.unmount();
  open();
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Saved title',
  );
});

it('requires confirmation before a whole-config save overwrites a newer inline change', async () => {
  const { open, onClose } = setup();
  const editor = open();
  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: 'Draft description' },
  });
  editor.rerender(
    <HelpCenterDrawer
      helpCenter={{ ...saved, title: 'Inline rename' }}
      onClose={onClose}
    />,
  );
  save();
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
  expect(mockSave).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

it('only closes after an explicit successful Save', async () => {
  const { open, onClose } = setup();
  open();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Updated Help Center' },
  });
  save();
  await waitFor(() =>
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'help-1', title: 'Updated Help Center' }),
    ),
  );
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

it('retains input after an unconfirmed save so the user can retry', async () => {
  mockSave.mockResolvedValueOnce({ data: null });
  const { open, onClose } = setup();
  open();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Retry this title' },
  });
  save();
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  expect(onClose).not.toHaveBeenCalled();
  expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
    'Retry this title',
  );
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
});

it('does not duplicate a slow create after reopening its draft', async () => {
  let finish: (value: {
    data: { helpCenterConfigUpdate: IHelpCenter };
  }) => void = () => undefined;
  mockSave.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const { openNew } = setup();
  const editor = openNew();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Create once' },
  });
  save();
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  editor.unmount();
  openNew();
  save();
  await act(() => Promise.resolve());
  expect(mockSave).toHaveBeenCalledTimes(1);
  await act(() =>
    Promise.resolve(
      finish({
        data: { helpCenterConfigUpdate: { ...saved, title: 'Create once' } },
      }),
    ),
  );
  await waitFor(() =>
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(''),
  );
});

it.each([
  { remountDuringCreate: false, discard: false },
  { remountDuringCreate: true, discard: false },
  { remountDuringCreate: true, discard: true },
])(
  'retains created identity with a late upload ($remountDuringCreate remount, $discard discard)',
  async ({ remountDuringCreate, discard }) => {
    let finish: (value: {
      data: { helpCenterConfigUpdate: IHelpCenter };
    }) => void = () => undefined;
    let submitted: IHelpCenterConfigInput = EMPTY_HELP_CENTER_FORM;
    mockSave.mockImplementationOnce(
      (config: IHelpCenterConfigInput) =>
        new Promise((resolve) => {
          submitted = config;
          finish = resolve;
        }),
    );
    const { openNew, onClose } = setup();
    let editor = openNew();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Create with logo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
    save();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave.mock.calls[0][0]._id).toBeUndefined();
    await act(() => Promise.resolve(mockFinishUpload()));
    expect((screen.getByLabelText('Main logo') as HTMLInputElement).value).toBe(
      'https://files/logo.png',
    );
    if (remountDuringCreate) {
      editor.unmount();
      editor = openNew();
      save();
      await act(() => Promise.resolve());
      expect(mockSave).toHaveBeenCalledTimes(1);
    }
    await act(() =>
      Promise.resolve(
        finish({
          data: {
            helpCenterConfigUpdate: {
              ...saved,
              title: submitted.title,
              description: submitted.description,
              _id: 'created-1',
            },
          },
        }),
      ),
    );
    expect(onClose).not.toHaveBeenCalled();
    if (remountDuringCreate) {
      editor.unmount();
      editor = openNew();
    }
    expect((screen.getByLabelText('Main logo') as HTMLInputElement).value).toBe(
      'https://files/logo.png',
    );
    expect(mockConfirm).not.toHaveBeenCalled();
    if (remountDuringCreate) {
      fireEvent.change(screen.getByLabelText('Main logo'), {
        target: { value: '' },
      });
      expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
        'Create with logo',
      );
      editor.unmount();
      editor = openNew();
      expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe(
        'Create with logo',
      );
      fireEvent.change(screen.getByLabelText('Main logo'), {
        target: { value: 'https://files/logo.png' },
      });
    }
    if (discard) {
      mockConfirm.mockResolvedValueOnce();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
      expect(mockSave).toHaveBeenCalledTimes(1);
    } else {
      mockSave.mockImplementationOnce((config: IHelpCenterConfigInput) =>
        Promise.resolve({
          data: {
            helpCenterConfigUpdate: { ...saved, ...config, _id: 'created-1' },
          },
        }),
      );
      save();
      await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
      expect(mockSave.mock.calls[1][0]).toEqual(
        expect.objectContaining({
          _id: 'created-1',
          title: 'Create with logo',
          styles: expect.objectContaining({
            mainLogo: 'https://files/logo.png',
          }),
        }),
      );
      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    }
    editor.unmount();
    openNew();
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Main logo') as HTMLInputElement).value).toBe(
      '',
    );
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Another Help Center' },
    });
    save();
    await waitFor(() =>
      expect(mockSave).toHaveBeenCalledTimes(discard ? 2 : 3),
    );
    expect(mockSave.mock.calls[discard ? 1 : 2][0]._id).toBeUndefined();
  },
);

it('blocks Cancel while a save is running', () => {
  mockLoading = true;
  const { open, onClose } = setup();
  open();
  const cancel = screen.getByRole('button', { name: 'Cancel' });
  expect(
    cancel.closest('fieldset')?.disabled ||
      (cancel as HTMLButtonElement).disabled,
  ).toBe(true);
  fireEvent.click(cancel);
  expect(onClose).not.toHaveBeenCalled();
});

it('removes retained create sessions associated with a deleted Help Center', async () => {
  const { wrapper, store } = setup();
  const retainedDraft = {
    values: { ...EMPTY_HELP_CENTER_FORM, title: 'Retained upload' },
    defaultValues: EMPTY_HELP_CENTER_FORM,
  };
  store.set(helpCenterPanelDraftsState, {
    'user-1:new:0': retainedDraft,
    'user-2:new:0': retainedDraft,
    'user-1:created-1': retainedDraft,
    'user-1:new:1': retainedDraft,
  });
  store.set(helpCenterPanelCreatedState, {
    'user-1:new:0': { id: 'created-1', values: EMPTY_HELP_CENTER_FORM },
    'user-2:new:0': { id: 'created-1', values: EMPTY_HELP_CENTER_FORM },
    'user-1:new:1': { id: 'created-2', values: EMPTY_HELP_CENTER_FORM },
  });
  mockRemove.mockImplementation(
    ({
      update,
    }: {
      update: (
        cache: Pick<ApolloCache<unknown>, 'evict' | 'identify' | 'gc'>,
      ) => void;
    }) =>
      Promise.resolve().then(() => {
        update({ evict: jest.fn(), identify: jest.fn(), gc: jest.fn() });
        return {};
      }),
  );
  const { result } = renderHook(() => useRemoveHelpCenters(), { wrapper });
  await act(() =>
    Promise.resolve(result.current.removeHelpCenters(['created-1'])),
  );
  expect(store.get(helpCenterPanelDraftsState)).toEqual({
    'user-1:new:1': retainedDraft,
  });
  expect(store.get(helpCenterPanelCreatedState)).toEqual({
    'user-1:new:1': { id: 'created-2', values: EMPTY_HELP_CENTER_FORM },
  });
});

it.each([false, true])(
  'confirms a background rename before continuing creation (remount: %s)',
  async (remount) => {
    let finish: (value: {
      data: { helpCenterConfigUpdate: IHelpCenter };
    }) => void = () => undefined;
    mockSave.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const { openNew, onClose } = setup();
    let editor = openNew();
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Create with logo' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
    save();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    await act(() => Promise.resolve(mockFinishUpload()));
    await act(() =>
      Promise.resolve(
        finish({
          data: {
            helpCenterConfigUpdate: {
              ...saved,
              _id: 'created-1',
              title: 'Create with logo',
              description: '',
            },
          },
        }),
      ),
    );
    if (remount) {
      editor.unmount();
      editor = openNew();
    }
    mockRead.mockResolvedValue({
      data: {
        helpCenterConfig: {
          ...saved,
          _id: 'created-1',
          title: 'Inline rename',
          description: '',
        },
      },
    });
    let overwrite: () => void = () => undefined;
    mockConfirm.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          overwrite = resolve;
        }),
    );
    save();
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(mockRead).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: { _id: 'created-1' },
        fetchPolicy: 'network-only',
      }),
    );
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Main logo') as HTMLInputElement).value).toBe(
      'https://files/logo.png',
    );
    expect(
      screen.getByRole('button', { name: 'Cancel' }).closest('fieldset')
        ?.disabled,
    ).toBe(false);
    editor.unmount();
    editor = openNew();
    await act(() => Promise.resolve(overwrite()));
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect((screen.getByLabelText('Main logo') as HTMLInputElement).value).toBe(
      'https://files/logo.png',
    );
    mockConfirm.mockResolvedValueOnce();
    mockSave.mockImplementationOnce((config: IHelpCenterConfigInput) =>
      Promise.resolve({
        data: {
          helpCenterConfigUpdate: { ...saved, ...config, _id: 'created-1' },
        },
      }),
    );
    save();
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
    expect(mockSave.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        _id: 'created-1',
        title: 'Create with logo',
        styles: expect.objectContaining({ mainLogo: 'https://files/logo.png' }),
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  },
);

it.each(['unchanged', 'read failure', 'missing record'])(
  'recovers retained creation with a fresh check: %s',
  async (scenario) => {
    const { store, openNew, onClose } = setup();
    const confirmed = { ...EMPTY_HELP_CENTER_FORM, title: 'Create with logo' };
    const draft = {
      ...confirmed,
      styles: { ...confirmed.styles, mainLogo: 'https://files/logo.png' },
    };
    store.set(helpCenterPanelCreatedState, {
      'user-1:new:0': { id: 'created-1', values: confirmed },
    });
    store.set(helpCenterPanelDraftsState, {
      'user-1:new:0': { values: draft, defaultValues: confirmed },
    });
    const editor = openNew();
    if (scenario === 'read failure')
      mockRead.mockRejectedValueOnce(new Error('Network unavailable'));
    if (scenario === 'missing record')
      mockRead.mockResolvedValueOnce({ data: { helpCenterConfig: null } });
    mockSave.mockImplementationOnce((config: IHelpCenterConfigInput) =>
      Promise.resolve({
        data: {
          helpCenterConfigUpdate: { ...saved, ...config, _id: 'created-1' },
        },
      }),
    );
    save();
    await waitFor(() => expect(mockRead).toHaveBeenCalledTimes(1));
    if (scenario !== 'unchanged') {
      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({ variant: 'destructive' }),
        ),
      );
      expect(mockSave).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(
        (screen.getByLabelText('Main logo') as HTMLInputElement).value,
      ).toBe('https://files/logo.png');
      editor.unmount();
      openNew();
      save();
    }
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockConfirm).not.toHaveBeenCalled();
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: 'created-1',
        styles: expect.objectContaining({ mainLogo: 'https://files/logo.png' }),
      }),
    );
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  },
);

it('leaves B open when deletion from an unmounted A action finishes', async () => {
  const { wrapper } = setup();
  const title = render(
    <HelpCenterRecordPanel
      contentType="frontline:helpcenter"
      contentId="help-1"
      view="title"
    />,
    { wrapper },
  );
  let finish: () => void = () => undefined;
  mockRemove.mockImplementationOnce(
    ({
      update,
    }: {
      update: (
        cache: Pick<ApolloCache<unknown>, 'evict' | 'identify' | 'gc'>,
      ) => void;
    }) =>
      new Promise<void>((resolve) => {
        finish = () => {
          update({ evict: jest.fn(), identify: jest.fn(), gc: jest.fn() });
          resolve();
        };
      }),
  );
  const action = renderHook(useRemoveHelpCenters, { wrapper });
  let request: Promise<void>;
  act(() => {
    request = action.result.current.removeHelpCenters(['help-1']);
  });
  action.unmount();
  title.unmount();
  mockRecordId = 'help-2';
  render(
    <HelpCenterRecordPanel
      contentType="frontline:helpcenter"
      contentId="help-2"
      view="title"
    />,
    { wrapper },
  );
  await act(async () => {
    finish();
    await request;
  });
  expect(mockClose).not.toHaveBeenCalled();
  expect(mockBack).not.toHaveBeenCalled();
});

it('retains an image that finishes uploading after Activity unmounts the form', async () => {
  const { open } = setup();
  const detail = open();
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  detail.unmount();
  await act(() => Promise.resolve(mockFinishUpload()));
  open();
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe(
    'https://files/logo.png',
  );
});

it('returns to the parent when the selected deleted Help Center outlives its action owner', async () => {
  const { wrapper } = setup();
  render(
    <HelpCenterRecordPanel
      contentType="frontline:helpcenter"
      contentId="help-1"
      view="title"
    />,
    { wrapper },
  );
  let finish: () => void = () => undefined;
  mockRemove.mockImplementationOnce(
    ({
      update,
    }: {
      update: (
        cache: Pick<ApolloCache<unknown>, 'evict' | 'identify' | 'gc'>,
      ) => void;
    }) =>
      new Promise<void>((resolve) => {
        finish = () => {
          update({ evict: jest.fn(), identify: jest.fn(), gc: jest.fn() });
          resolve();
        };
      }),
  );
  const action = renderHook(useRemoveHelpCenters, { wrapper });
  let request: Promise<void>;
  act(() => {
    request = action.result.current.removeHelpCenters(['help-1']);
  });
  action.unmount();
  await act(async () => {
    finish();
    await request;
  });
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(mockClose).not.toHaveBeenCalled();
});

it('ignores a late image after logout and signing back in as the same user', async () => {
  const { open, store } = setup();
  const detail = open();
  const user = store.get(currentUserState);
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  detail.unmount();
  act(() => {
    store.set(currentUserState, null);
    store.set(currentUserState, user);
  });
  await act(() => Promise.resolve(mockFinishUpload()));
  open();
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe('');
});

it('does not restore an image after its draft is explicitly discarded', async () => {
  const { open } = setup();
  const detail = open();
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  detail.unmount();
  await act(() => Promise.resolve(mockFinishUpload()));
  open();
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe('');
});

it('continues the confirmed create when an image finishes after the save and unmount', async () => {
  mockSave.mockImplementation((config: IHelpCenterConfigInput) =>
    Promise.resolve({
      data: {
        helpCenterConfigUpdate: { ...saved, ...config, _id: 'created-1' },
      },
    }),
  );
  const { openNew, onClose } = setup();
  const detail = openNew();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Create with logo' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  detail.unmount();
  await act(() => Promise.resolve(mockFinishUpload()));
  const continued = openNew();
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe(
    'https://files/logo.png',
  );
  save();
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
  expect(mockSave.mock.calls[1][0]).toEqual(
    expect.objectContaining({
      _id: 'created-1',
      styles: expect.objectContaining({ mainLogo: 'https://files/logo.png' }),
    }),
  );
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(2));
  continued.unmount();
  openNew();
  expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe('');
});

it('keeps Save and Cancel usable when an upload never reports completion', async () => {
  mockSave.mockImplementation((config: IHelpCenterConfigInput) =>
    Promise.resolve({
      data: {
        helpCenterConfigUpdate: { ...saved, ...config, _id: 'created-1' },
      },
    }),
  );
  const { openNew, onClose } = setup();
  const detail = openNew();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Create with logo' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  detail.unmount();
  const continued = openNew();
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
  ).toBe(false);
  save();
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledTimes(3));
  continued.unmount();
  await act(() => Promise.resolve(mockFinishUpload()));
  openNew();
  expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe('');
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe('');
});

it('merges a late image into the newer remounted settings', async () => {
  const { open } = setup();
  const detail = open();
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  detail.unmount();
  open();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Newer title' },
  });
  await act(() => Promise.resolve(mockFinishUpload()));
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe(
    'https://files/logo.png',
  );
  expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe(
    'Newer title',
  );
});

it('invalidates the uploaded image writer when its Help Center is deleted', async () => {
  const { open, wrapper, store } = setup();
  const detail = open();
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  detail.unmount();
  mockRemove.mockImplementationOnce(
    ({
      update,
    }: {
      update: (
        cache: Pick<ApolloCache<unknown>, 'evict' | 'identify' | 'gc'>,
      ) => void;
    }) =>
      Promise.resolve().then(() => {
        update({ evict: jest.fn(), identify: jest.fn(), gc: jest.fn() });
        return {};
      }),
  );
  const deletion = renderHook(useRemoveHelpCenters, { wrapper });
  await act(() => deletion.result.current.removeHelpCenters(['help-1']));
  await act(() => Promise.resolve(mockFinishUpload()));
  expect(
    store.get(helpCenterPanelDraftsState)['user-1:help-1'],
  ).toBeUndefined();
});

it('does not recreate a deleted draft when an earlier save finishes', async () => {
  const { open, wrapper, store, onClose } = setup();
  let finish: (value: {
    data: { helpCenterConfigUpdate: IHelpCenter };
  }) => void = () => undefined;
  mockSave.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const detail = open();
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Pending title' },
  });
  save();
  await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
  detail.unmount();
  mockRemove.mockImplementationOnce(
    ({
      update,
    }: {
      update: (
        cache: Pick<ApolloCache<unknown>, 'evict' | 'identify' | 'gc'>,
      ) => void;
    }) =>
      Promise.resolve().then(() => {
        update({ evict: jest.fn(), identify: jest.fn(), gc: jest.fn() });
        return {};
      }),
  );
  const deletion = renderHook(useRemoveHelpCenters, { wrapper });
  await act(() => deletion.result.current.removeHelpCenters(['help-1']));
  await act(() =>
    Promise.resolve(
      finish({
        data: { helpCenterConfigUpdate: { ...saved, title: 'Pending title' } },
      }),
    ),
  );
  expect(
    store.get(helpCenterPanelDraftsState)['user-1:help-1'],
  ).toBeUndefined();
  expect(onClose).not.toHaveBeenCalled();
});

it('returns to the parent when cancelling an unchanged stacked Help Center', async () => {
  const { wrapper } = setup();
  render(
    <HelpCenterRecordPanel
      contentType="frontline:helpcenter"
      contentId="help-1"
      view="detail"
    />,
    { wrapper },
  );
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  });
  expect(mockBack).toHaveBeenCalledTimes(1);
  expect(mockClose).not.toHaveBeenCalled();
});

it('does not restore a replacement image removed after an Activity remount', async () => {
  const { open } = setup();
  const detail = open();
  fireEvent.click(screen.getByRole('button', { name: 'Start logo upload' }));
  detail.unmount();
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Remove logo' }));
  await act(() => Promise.resolve(mockFinishUpload()));
  expect(screen.getByLabelText<HTMLInputElement>('Main logo').value).toBe('');
});
