import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ComponentProps, PropsWithChildren } from 'react';
import { createStore, Provider } from 'jotai';
import { CreatePipelinePanelForm } from '@/pipelines/components/CreatePipeline';
import { PipelineDetail } from '@/pipelines/components/PipelineDetail';
import { ChannelMembersAddForm } from '@/channels/components/settings/members/ChannelMembersAddForm';
import { ChannelCreateForm } from '@/channels/components/settings/channels-list/ChannelCreateForm';
import { StatusPanelForm } from '@/status/components/StatusSheet';
import { ResponseTemplateEditor } from '@/responseTemplate/components/ResponseDetail';
import { TicketConfigEditor } from '@/pipelines/components/configs/components/CreateConfig';
import type { TPipelineConfig } from '@/pipelines/types';
import type { ITicketConfigDetail } from '@/pipelines/components/configs/hooks/useGetTicketConfigDetail';

const mockConfirm = jest.fn<Promise<void>, [unknown]>();
const mockEnterScope = jest.fn();
const mockRestoreScope = jest.fn();
let mockActiveRecord = 'original';
let mockContentType = 'frontline:response-template';
const mockNavigate = jest.fn();
const mockPipeline = {
  _id: 'pipeline-a',
  name: 'Saved pipeline',
  description: 'Saved description',
};
interface PipelineOptions {
  variables: { name?: string; channelId?: string };
  onCompleted?: (result: { createPipeline?: { _id: string } }) => void;
  onError?: (error: Error) => void;
}
interface SaveOptions {
  variables: unknown;
  onCompleted?: () => void;
  onError?: (error: Error) => void;
}
interface ChannelOptions {
  variables: unknown;
  onCompleted?: (result: { channelAdd?: { _id: string } }) => void;
  onError?: (error: Error) => void;
}
const mockAddPipeline = jest.fn<void, [PipelineOptions]>();
const mockUpdatePipeline = jest.fn<void, [SaveOptions]>();
const mockAddMembers = jest.fn<void, [SaveOptions]>();
const mockAddStatus = jest.fn<void, [SaveOptions]>();
const mockUpdateStatus = jest.fn<void, [SaveOptions]>();
const mockAddChannel = jest.fn<void, [ChannelOptions]>();
let mockScope = { id: 'channel-a', pipelineId: 'pipeline-a' };
const mockOpenRecord = ({ contentId }: { contentId: string }) => {
  mockActiveRecord = contentId;
};
const close = () => {
  mockActiveRecord = 'closed';
};

interface ResponseInput {
  name: string;
  content: string;
  channelId?: string;
  id?: string;
}
interface ResponseOptions {
  variables: ResponseInput;
  onCompleted?: (result: { responseTemplatesAdd?: { _id: string } }) => void;
  onError?: (error: Error) => void;
}
interface ConfigOptions {
  variables: { input: TPipelineConfig };
  onCompleted?: () => void;
  onError?: (error: Error) => void;
}
const mockAddResponse = jest.fn<void, [ResponseOptions]>();
const mockUpdateResponse = jest.fn<void, [ResponseOptions]>();
const mockSaveConfig = jest.fn<void, [ConfigOptions]>();

jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const { forwardRef, useEffect, useState } =
    jest.requireActual<typeof import('react')>('react');
  const Container = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const Form = Object.assign(
    ({ children, ...methods }: ComponentProps<typeof FormProvider>) => (
      <FormProvider {...methods}>{children}</FormProvider>
    ),
    {
      Field: Controller,
      Item: Container,
      Label: Container,
      Control: Container,
      Message: () => null,
      Description: Container,
    },
  );
  const Editor = ({
    initialContent,
    onChange,
  }: {
    initialContent: string;
    onChange: (content: string) => void;
  }) => {
    const [content, setContent] = useState(initialContent);
    useEffect(() => {
      if (initialContent) setContent(initialContent);
    }, [initialContent]);
    return (
      <textarea
        aria-label="content"
        value={content}
        onChange={(event) => {
          setContent(event.target.value);
          onChange(event.target.value);
        }}
      />
    );
  };
  return {
    Form,
    Input: forwardRef<HTMLInputElement, ComponentProps<'input'>>(
      (props, ref) => <input {...props} aria-label={props.name} ref={ref} />,
    ),
    Button: ({ children, ...props }: ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
    Kbd: Container,
    Textarea: forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(
      (props, ref) => <textarea {...props} aria-label={props.name} ref={ref} />,
    ),
    useToast: () => ({ toast: jest.fn() }),
    Editor,
    ScrollArea: Container,
    Sheet: { Content: Container },
    Combobox: { Trigger: Container, Content: Container },
    PopoverScoped: Container,
    Separator: () => null,
    Spinner: () => null,
    toast: jest.fn(),
    useConfirm: () => ({ confirm: mockConfirm }),
    isDeeplyEqual:
      jest.requireActual<typeof import('deep-equal')>('deep-equal'),
    useSetHotkeyScope: () => mockEnterScope,
    usePreviousHotkeyScope: () => ({
      setHotkeyScopeAndMemorizePreviousScope: mockEnterScope,
      goBackToPreviousHotkeyScope: mockRestoreScope,
    }),
    useScopedHotkeys: jest.fn(),
  };
});
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({
    openRecord: mockOpenRecord,
    close,
    record: { contentType: mockContentType, contentId: mockActiveRecord },
  }),
  SelectTags: {
    Provider: ({ children }: PropsWithChildren) => <div>{children}</div>,
    Value: () => null,
    GroupsCommand: () => null,
  },
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
  }),
}));
jest.mock('react-router-dom', () => ({
  useParams: () => ({}),
  useLocation: () => ({ search: '' }),
  useNavigate: () => mockNavigate,
}));
jest.mock('@/settings/components/SettingsPanelForm', () => ({
  SettingsPanelFooter: ({
    onCancel,
    submitLabel,
    loading,
    disabled,
  }: {
    onCancel: () => void;
    submitLabel: string;
    loading?: boolean;
    disabled?: boolean;
  }) => (
    <div>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="submit" disabled={loading || disabled}>
        {submitLabel}
      </button>
    </div>
  ),
}));
jest.mock('@/settings/contexts/SettingsPanelContext', () => ({
  useSettingsParams: () => mockScope,
}));
jest.mock('@/pipelines/hooks/useAddPipeline', () => ({
  usePipelineAdd: () => ({ addPipeline: mockAddPipeline, loading: false }),
}));
jest.mock('@/pipelines/hooks/useUpdatePipeline', () => ({
  useUpdatePipeline: () => ({
    updatePipeline: mockUpdatePipeline,
    loading: false,
  }),
}));
jest.mock('@/pipelines/hooks/useGetPipeline', () => ({
  useGetPipeline: () => ({ pipeline: mockPipeline }),
}));
jest.mock('@/pipelines/components/PipelineConfig', () => ({
  PipelineConfig: () => null,
}));
jest.mock('@/channels/hooks/useChannelMembersAdd', () => ({
  useChannelMembersAdd: () => ({
    channelAddMembers: mockAddMembers,
    loading: false,
  }),
}));
jest.mock('@/channels/hooks/useChannelAdd', () => ({
  useChannelAdd: () => ({ addChannel: mockAddChannel, loading: false }),
}));
jest.mock('@/status/hooks/useAddTicketStatus', () => ({
  useAddTicketStatus: () => ({ addStatus: mockAddStatus, loading: false }),
}));
jest.mock('@/status/hooks/useUpdateTicketStatus', () => ({
  useUpdateTicketStatus: () => ({
    updateStatus: mockUpdateStatus,
    loading: false,
  }),
}));
jest.mock('@/status/components/StatusNameColorField', () => ({
  StatusNameColorField: ({
    form,
  }: {
    form: import('react-hook-form').UseFormReturn<{ name: string }>;
  }) => <input aria-label="name" {...form.register('name')} />,
}));
jest.mock('@/channels/components/settings/channels-list/ChannelForm', () => ({
  ChannelForm: ({
    form,
  }: {
    form: import('react-hook-form').UseFormReturn<{ name: string }>;
  }) => <input aria-label="name" {...form.register('name')} />,
}));
jest.mock('@/channels/components/settings/members/MemberForm', () => ({
  MemberForm: ({
    form,
  }: {
    form: import('react-hook-form').UseFormReturn<{ memberIds: string[] }>;
  }) => (
    <input
      aria-label="members"
      value={form.watch('memberIds').join(',')}
      onChange={(event) =>
        form.setValue('memberIds', event.target.value.split(','), {
          shouldDirty: true,
        })
      }
    />
  ),
}));
jest.mock('@/responseTemplate/hooks/useAddResponse', () => ({
  useResponseAdd: () => ({ addResponse: mockAddResponse, loading: false }),
}));
jest.mock('@/responseTemplate/hooks/useUpdateResponses', () => ({
  useUpdateResponse: () => ({
    updateResponse: mockUpdateResponse,
    loading: false,
  }),
}));
jest.mock('@/pipelines/components/configs/hooks/useSaveTicketsConfig', () => ({
  useSaveTicketsConfig: () => ({
    saveTicketsConfig: mockSaveConfig,
    loading: false,
  }),
}));
jest.mock('@/ticket/components/ticket-selects/SelectStatusTicket', () => ({
  SelectStatusTicket: {
    FormItem: ({
      value,
      onValueChange,
    }: {
      value?: string;
      onValueChange: (value: string) => void;
    }) => (
      <input
        aria-label="status"
        value={value ?? ''}
        onChange={(event) => onValueChange(event.target.value)}
      />
    ),
  },
}));
jest.mock(
  '@/pipelines/components/configs/components/TicketBasicFields',
  () => ({
    TicketBasicFields: () => null,
  }),
);
jest.mock(
  '@/pipelines/components/configs/components/TicketPropertyFields',
  () => ({
    TicketPropertyFields: () => null,
  }),
);

const response = {
  _id: 'response-a',
  name: 'Saved response',
  content: 'Saved content',
  channelId: 'channel-a',
  createdAt: null,
  updatedAt: null,
  files: null,
};
const config: ITicketConfigDetail = {
  id: 'config-a',
  name: 'Saved configuration',
  channelId: 'channel-a',
  pipelineId: 'pipeline-a',
  selectedStatusId: 'status-a',
  parentId: null,
  formFields: null,
  propertyFields: [],
  createdAt: null,
  updatedAt: null,
};
const changeName = (value: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: 'name' }), {
    target: { value },
  });
const expectName = (value: string) =>
  expect(screen.getByRole('textbox', { name: 'name' })).toMatchObject({
    value,
  });

type SavedEditorKind = 'response' | 'configuration';
const savedEditors: {
  kind: SavedEditorKind;
  label: string;
  savedName: string;
  submitLabel: string;
}[] = [
  {
    kind: 'response',
    label: 'response',
    savedName: response.name,
    submitLabel: 'Update',
  },
  {
    kind: 'configuration',
    label: 'ticket configuration',
    savedName: config.name,
    submitLabel: 'Save',
  },
];

const renderSavedEditor = (kind: SavedEditorKind) => {
  const store = createStore();
  const editor = (name?: string) => (
    <Provider store={store}>
      {kind === 'response' ? (
        <ResponseTemplateEditor
          response={{ ...response, name: name ?? response.name }}
          channelId="channel-a"
          onClose={close}
        />
      ) : (
        <TicketConfigEditor
          config={{ ...config, name: name ?? config.name }}
          onClose={close}
        />
      )}
    </Provider>
  );
  const view = render(editor());
  return {
    refetch: (name: string) => view.rerender(editor(name)),
    leave: () =>
      view.rerender(
        <Provider store={store}>
          <p>Activity</p>
        </Provider>,
      ),
    reopen: () => view.rerender(editor()),
  };
};

const submitSavedEdit = async (
  kind: SavedEditorKind,
  submitLabel: string,
  name: string,
) => {
  changeName(name);
  fireEvent.click(screen.getByText(submitLabel));
  const save = kind === 'response' ? mockUpdateResponse : mockSaveConfig;
  await waitFor(() => expect(save).toHaveBeenCalled());
  if (kind === 'response') {
    const pending = mockUpdateResponse.mock.calls[0][0];
    return {
      succeed: () => pending.onCompleted?.({}),
      fail: (error: Error) => pending.onError?.(error),
    };
  }
  const pending = mockSaveConfig.mock.calls[0][0];
  return {
    succeed: () => pending.onCompleted?.(),
    fail: (error: Error) => pending.onError?.(error),
  };
};

beforeAll(() => {
  const cloneDraftValue = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(cloneDraftValue);
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          cloneDraftValue(item),
        ]),
      );
    }
    return value;
  };
  Object.defineProperty(globalThis, 'structuredClone', {
    value: cloneDraftValue,
  });
});

beforeEach(() => {
  mockConfirm
    .mockReset()
    .mockImplementation(() => new Promise<void>(() => undefined));
  mockAddResponse.mockReset();
  [
    mockAddPipeline,
    mockUpdatePipeline,
    mockAddMembers,
    mockAddStatus,
    mockUpdateStatus,
    mockAddChannel,
    mockNavigate,
  ].forEach((mock) => mock.mockReset());
  mockContentType = 'frontline:response-template';
  mockUpdateResponse.mockReset();
  mockSaveConfig.mockReset();
  mockEnterScope.mockReset();
  mockRestoreScope.mockReset();
  mockActiveRecord = 'original';
  mockScope = { id: 'channel-a', pipelineId: 'pipeline-a' };
});

test.each(savedEditors)(
  'restores a $label draft after switching away and preserves it through refetch',
  ({ kind }) => {
    const session = renderSavedEditor(kind);
    changeName('Unsaved draft');
    session.refetch('Refetched name');
    expectName('Unsaved draft');
    session.leave();
    session.reopen();
    expectName('Unsaved draft');
  },
);

test('returning to a response draft restores its original channel scope', async () => {
  const store = createStore();
  const editor = (channelId: string) => (
    <Provider store={store}>
      <ResponseTemplateEditor channelId={channelId} onClose={close} />
    </Provider>
  );
  const { rerender } = render(editor('channel-a'));
  changeName('New response');
  fireEvent.change(screen.getByRole('textbox', { name: 'content' }), {
    target: { value: 'New content' },
  });

  rerender(editor('channel-b'));
  expectName('');
  rerender(editor('channel-a'));
  expectName('New response');
  fireEvent.click(screen.getByText('Create'));

  await waitFor(() => expect(mockAddResponse).toHaveBeenCalled());
  expect(mockAddResponse.mock.calls[0][0].variables.channelId).toBe(
    'channel-a',
  );
});

test('a separate response channel starts with an empty rich editor', async () => {
  mockConfirm.mockResolvedValueOnce(undefined);
  const store = createStore();
  const editor = (channelId: string) => (
    <Provider store={store}>
      <ResponseTemplateEditor channelId={channelId} onClose={close} />
    </Provider>
  );
  const { rerender } = render(editor('channel-a'));
  changeName('Old draft');
  const contentEditor = screen.getByRole('textbox', { name: 'content' });
  fireEvent.change(contentEditor, {
    target: { value: 'Old draft content' },
  });
  expect(screen.getByRole('textbox', { name: 'content' })).toBe(contentEditor);

  rerender(editor('channel-b'));

  await waitFor(() => expectName(''));
  expect(screen.getByRole('textbox', { name: 'content' })).toMatchObject({
    value: '',
  });
});

test('a late response create success leaves a newer active record open', async () => {
  const store = createStore();
  const { unmount } = render(
    <Provider store={store}>
      <ResponseTemplateEditor channelId="channel-a" onClose={close} />
    </Provider>,
  );
  changeName('New response');
  fireEvent.change(screen.getByRole('textbox', { name: 'content' }), {
    target: { value: 'New content' },
  });
  fireEvent.click(screen.getByText('Create'));
  await waitFor(() => expect(mockAddResponse).toHaveBeenCalled());
  const pending = mockAddResponse.mock.calls[0][0];
  unmount();
  mockActiveRecord = 'newer-record';

  act(() =>
    pending.onCompleted?.({
      responseTemplatesAdd: { _id: 'created-response' },
    }),
  );

  expect(mockActiveRecord).toBe('newer-record');
});

test('returning to a ticket config draft restores its original scope', async () => {
  const store = createStore();
  const editor = () => (
    <Provider store={store}>
      <TicketConfigEditor onClose={close} />
    </Provider>
  );
  const { rerender } = render(editor());
  changeName('New configuration');
  fireEvent.change(screen.getByRole('textbox', { name: 'status' }), {
    target: { value: 'status-a' },
  });

  mockScope = { id: 'channel-b', pipelineId: 'pipeline-b' };
  rerender(editor());
  expectName('');
  mockScope = { id: 'channel-a', pipelineId: 'pipeline-a' };
  rerender(editor());
  expectName('New configuration');
  fireEvent.click(screen.getByText('Add'));

  await waitFor(() => expect(mockSaveConfig).toHaveBeenCalled());
  expect(mockSaveConfig.mock.calls[0][0].variables.input).toMatchObject({
    channelId: 'channel-a',
    pipelineId: 'pipeline-a',
  });
});

test('a late ticket config save leaves a newer active record open', async () => {
  const store = createStore();
  const { unmount } = render(
    <Provider store={store}>
      <TicketConfigEditor config={config} onClose={close} />
    </Provider>,
  );
  changeName('Updated configuration');
  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(mockSaveConfig).toHaveBeenCalled());
  const pending = mockSaveConfig.mock.calls[0][0];
  unmount();
  mockActiveRecord = 'newer-record';

  act(() => pending.onCompleted?.());

  expect(mockActiveRecord).toBe('newer-record');
});

test('response editor restores the previous hotkey scope when it unmounts', () => {
  const { unmount } = render(
    <Provider>
      <ResponseTemplateEditor
        response={response}
        channelId="channel-a"
        onClose={close}
      />
    </Provider>,
  );
  unmount();
  expect(mockRestoreScope).toHaveBeenCalledTimes(1);
});

test.each(savedEditors)(
  'Cancel discards the $label draft being edited',
  ({ kind, savedName }) => {
    const session = renderSavedEditor(kind);
    changeName('Unsaved draft');
    fireEvent.click(screen.getByText('Cancel'));
    session.leave();
    session.reopen();
    expectName(savedName);
  },
);

test.each(savedEditors)(
  'a failed $label save keeps its draft for the next visit',
  async ({ kind, submitLabel }) => {
    const session = renderSavedEditor(kind);
    const pending = await submitSavedEdit(
      kind,
      submitLabel,
      'Retry this draft',
    );
    act(() => pending.fail(new Error('Offline')));
    session.leave();
    session.reopen();
    expectName('Retry this draft');
  },
);

test.each(savedEditors)(
  'a successful $label save clears its persisted draft',
  async ({ kind, submitLabel, savedName }) => {
    const session = renderSavedEditor(kind);
    const pending = await submitSavedEdit(kind, submitLabel, 'Updated record');
    act(() => pending.succeed());
    if (kind === 'response')
      expect(screen.getByText('Update')).toMatchObject({ disabled: true });
    else expect(mockActiveRecord).toBe('closed');
    session.leave();
    session.reopen();
    expectName(savedName);
  },
);

test('edits after a successful response save persist when the editor stays open', async () => {
  const session = renderSavedEditor('response');
  const pending = await submitSavedEdit(
    'response',
    'Update',
    'First saved edit',
  );
  act(() => pending.succeed());
  changeName('Second unsaved edit');
  session.leave();
  session.reopen();
  expectName('Second unsaved edit');
});

test.each(savedEditors)(
  'an old $label save does not erase a newer draft of the reopened record',
  async ({ kind, submitLabel }) => {
    const session = renderSavedEditor(kind);
    const pending = await submitSavedEdit(
      kind,
      submitLabel,
      'Submitted record',
    );
    session.leave();
    session.reopen();
    changeName('Newer unsaved draft');
    act(() => pending.succeed());
    session.leave();
    session.reopen();
    expectName('Newer unsaved draft');
  },
);

test('a config hydrated from Apollo metadata still closes after a successful normalized save', async () => {
  const configWithMetadata = {
    ...config,
    formFields: {
      __typename: 'TicketConfigFormFields',
      name: {
        __typename: 'TicketConfigFormField',
        isShow: true,
        label: 'Name',
        order: 1,
        placeholder: '',
      },
      description: null,
      attachment: null,
      tags: null,
    },
  };
  render(
    <Provider>
      <TicketConfigEditor config={configWithMetadata} onClose={close} />
    </Provider>,
  );
  changeName('Normalized configuration');
  fireEvent.click(screen.getByText('Save'));
  await waitFor(() => expect(mockSaveConfig).toHaveBeenCalled());

  act(() => mockSaveConfig.mock.calls[0][0].onCompleted?.());

  expect(mockActiveRecord).toBe('closed');
});

test('response creation remains pending across an Activity roundtrip and can retry after failure', async () => {
  const store = createStore();
  const editor = (
    <Provider store={store}>
      <ResponseTemplateEditor channelId="channel-a" onClose={close} />
    </Provider>
  );
  const session = render(editor);
  changeName('One response');
  fireEvent.change(screen.getByRole('textbox', { name: 'content' }), {
    target: { value: 'One content' },
  });
  fireEvent.click(screen.getByText('Create'));
  await waitFor(() => expect(mockAddResponse).toHaveBeenCalledTimes(1));
  session.rerender(
    <Provider store={store}>
      <p>Activity</p>
    </Provider>,
  );
  session.rerender(editor);
  expectName('One response');
  fireEvent.click(screen.getByText('Create'));
  await act(async () => undefined);
  expect(mockAddResponse).toHaveBeenCalledTimes(1);
  act(() => mockAddResponse.mock.calls[0][0].onError?.(new Error('Offline')));
  fireEvent.click(screen.getByText('Create'));
  await waitFor(() => expect(mockAddResponse).toHaveBeenCalledTimes(2));
});

const lifecycleEditors = [
  {
    kind: 'pipeline',
    label: 'Create',
    field: 'name',
    contentType: 'frontline:pipeline',
    render: () => <CreatePipelinePanelForm channelId="channel-a" />,
  },
  {
    kind: 'status',
    label: 'Save',
    field: 'name',
    contentType: 'frontline:ticket-status',
    render: () => <StatusPanelForm onClose={close} statusType={1} />,
  },
  {
    kind: 'members',
    label: 'Add',
    field: 'members',
    contentType: 'frontline:channel-members',
    render: () => <ChannelMembersAddForm channelId="channel-a" />,
  },
];

test.each(lifecycleEditors)(
  '$kind retains its unsaved values after Activity unmounts its editor',
  ({ field, render: editor }) => {
    const store = createStore();
    const session = render(<Provider store={store}>{editor()}</Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: field }), {
      target: { value: 'Unsaved value' },
    });
    session.rerender(
      <Provider store={store}>
        <p>Activity</p>
      </Provider>,
    );
    session.rerender(<Provider store={store}>{editor()}</Provider>);
    expect(screen.getByRole('textbox', { name: field })).toMatchObject({
      value: 'Unsaved value',
    });
  },
);

test('the saved pipeline General editor restores unsaved values after Activity', () => {
  const store = createStore();
  const editor = (
    <Provider store={store}>
      <PipelineDetail />
    </Provider>
  );
  const session = render(editor);
  changeName('Unsaved pipeline');
  session.rerender(
    <Provider store={store}>
      <p>Activity</p>
    </Provider>,
  );
  session.rerender(editor);
  expectName('Unsaved pipeline');
});

test.each(lifecycleEditors)(
  'a late $kind save keeps a newer panel open',
  async ({ kind, label, field, contentType, render: editor }) => {
    mockContentType = contentType;
    const session = render(<Provider>{editor()}</Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: field }), {
      target: { value: 'Submitted value' },
    });
    fireEvent.click(screen.getByText(label));
    const mutation =
      kind === 'pipeline'
        ? mockAddPipeline
        : kind === 'status'
          ? mockAddStatus
          : mockAddMembers;
    await waitFor(() => expect(mutation).toHaveBeenCalledTimes(1));
    session.unmount();
    mockActiveRecord = 'record-b';
    act(() => {
      if (kind === 'pipeline')
        mockAddPipeline.mock.calls[0][0].onCompleted?.({
          createPipeline: { _id: 'created-pipeline' },
        });
      else if (kind === 'status')
        mockAddStatus.mock.calls[0][0].onCompleted?.();
      else mockAddMembers.mock.calls[0][0].onCompleted?.();
    });
    expect(mockActiveRecord).toBe('record-b');
  },
);

test('channel creation keeps input typed after submission', async () => {
  mockActiveRecord = 'new';
  mockContentType = 'frontline:channel';
  render(
    <Provider>
      <ChannelCreateForm />
    </Provider>,
  );
  changeName('Submitted channel');
  fireEvent.click(screen.getByText('Create'));
  await waitFor(() => expect(mockAddChannel).toHaveBeenCalledTimes(1));
  changeName('Newer channel input');
  act(() =>
    mockAddChannel.mock.calls[0][0].onCompleted?.({
      channelAdd: { _id: 'created-channel' },
    }),
  );
  expectName('Newer channel input');
  expect(mockActiveRecord).toBe('new');
  expect(mockNavigate).not.toHaveBeenCalled();
});

test.each(lifecycleEditors)(
  'a successful active $kind save completes its own panel',
  async ({ kind, label, field, render: editor }) => {
    render(<Provider>{editor()}</Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: field }), {
      target: { value: 'Submitted value' },
    });
    fireEvent.click(screen.getByText(label));
    const mutation =
      kind === 'pipeline'
        ? mockAddPipeline
        : kind === 'status'
          ? mockAddStatus
          : mockAddMembers;
    await waitFor(() => expect(mutation).toHaveBeenCalledTimes(1));
    act(() => {
      if (kind === 'pipeline')
        mockAddPipeline.mock.calls[0][0].onCompleted?.({
          createPipeline: { _id: 'created-pipeline' },
        });
      else if (kind === 'status')
        mockAddStatus.mock.calls[0][0].onCompleted?.();
      else mockAddMembers.mock.calls[0][0].onCompleted?.();
    });
    expect(mockActiveRecord).toBe(
      kind === 'pipeline' ? 'created-pipeline' : 'closed',
    );
  },
);

test.each(lifecycleEditors)(
  'a failed $kind save keeps its values and allows retry',
  async ({ kind, label, field, render: editor }) => {
    render(<Provider>{editor()}</Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: field }), {
      target: { value: 'Retry value' },
    });
    fireEvent.click(screen.getByText(label));
    const mutation =
      kind === 'pipeline'
        ? mockAddPipeline
        : kind === 'status'
          ? mockAddStatus
          : mockAddMembers;
    await waitFor(() => expect(mutation).toHaveBeenCalledTimes(1));
    act(() => {
      if (kind === 'pipeline')
        mockAddPipeline.mock.calls[0][0].onError?.(new Error('Offline'));
      else if (kind === 'status')
        mockAddStatus.mock.calls[0][0].onError?.(new Error('Offline'));
      else mockAddMembers.mock.calls[0][0].onError?.(new Error('Offline'));
    });
    expect(screen.getByRole('textbox', { name: field })).toMatchObject({
      value: 'Retry value',
    });
    fireEvent.click(screen.getByText(label));
    await waitFor(() => expect(mutation).toHaveBeenCalledTimes(2));
  },
);

test('an edited saved status restores its draft after Activity and still updates the saved record', async () => {
  const store = createStore();
  const status = {
    _id: 'status-a',
    name: 'Saved status',
    description: 'Saved description',
    color: '#123456',
    pipelineId: 'pipeline-a',
    order: 0,
    type: 1,
    createdAt: null,
    updatedAt: null,
  };
  const editor = (
    <Provider store={store}>
      <StatusPanelForm editingStatus={status} onClose={close} statusType={1} />
    </Provider>
  );
  const session = render(editor);
  changeName('Unsaved status');
  session.rerender(
    <Provider store={store}>
      <p>Activity</p>
    </Provider>,
  );
  session.rerender(editor);
  expectName('Unsaved status');
  fireEvent.click(screen.getByText('Update'));
  await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledTimes(1));
  expect(mockUpdateStatus.mock.calls[0][0].variables).toMatchObject({
    id: 'status-a',
    name: 'Unsaved status',
  });
});

test.each(lifecycleEditors)(
  'Cancel discards the $kind draft before it reopens',
  ({ field, render: editor }) => {
    const store = createStore();
    const session = render(<Provider store={store}>{editor()}</Provider>);
    fireEvent.change(screen.getByRole('textbox', { name: field }), {
      target: { value: 'Discarded input' },
    });
    fireEvent.click(screen.getByText('Cancel'));
    session.rerender(
      <Provider store={store}>
        <p>Closed</p>
      </Provider>,
    );
    session.rerender(<Provider store={store}>{editor()}</Provider>);
    expect(screen.getByRole('textbox', { name: field })).toMatchObject({
      value: '',
    });
  },
);
