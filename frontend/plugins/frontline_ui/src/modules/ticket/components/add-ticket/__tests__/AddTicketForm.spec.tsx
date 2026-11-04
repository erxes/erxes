import type { PropsWithChildren, InputHTMLAttributes } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { currentUserState, sidePanelDraftState } from 'ui-modules';
import { AddTicketForm } from '../AddTicketForm';

const mockConfirm = jest.fn<Promise<void>, [unknown]>();
const mockCreateTicket = jest.fn();
const mockEditor = {
  document: [] as { type: string; content?: string }[],
  replaceBlocks: jest.fn(),
};
const mockBack = jest.fn();
const mockClose = jest.fn();
const mockRestoreScope = jest.fn();
const mockOpenRecord = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || _key,
  }),
}));
jest.mock('react-router-dom', () => ({
  Link: ({ children }: PropsWithChildren) => <span>{children}</span>,
  useLocation: () => ({ pathname: '/frontline/tickets' }),
}));
jest.mock('erxes-ui', () => {
  const { forwardRef } = jest.requireActual<typeof import('react')>('react');
  const { FormProvider, Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const { useHotkeys } =
    jest.requireActual<typeof import('react-hotkeys-hook')>(
      'react-hotkeys-hook',
    );
  const Wrap = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    isDeeplyEqual: jest.requireActual('deep-equal'),
    Form: Object.assign(FormProvider, {
      Field: Controller,
      Item: Wrap,
      Label: Wrap,
      Control: Wrap,
    }),
    Input: forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
      (props, ref) => <input {...props} ref={ref} aria-label={props.name} />,
    ),
    Button: ({ children }: PropsWithChildren) => (
      <button type="button">{children}</button>
    ),
    BlockEditor: ({ onChange }: { onChange: () => void }) => (
      <textarea
        aria-label="description"
        onChange={(event) => {
          mockEditor.document = [
            { type: 'paragraph', content: event.target.value },
            { type: 'paragraph' },
          ];
          onChange();
        }}
      />
    ),
    useBlockEditor: () => mockEditor,
    useConfirm: () => ({ confirm: mockConfirm }),
    useToast: () => ({ toast: jest.fn() }),
    usePreviousHotkeyScope: () => ({
      setHotkeyScopeAndMemorizePreviousScope: jest.fn(),
      goBackToPreviousHotkeyScope: mockRestoreScope,
    }),
    useSetHotkeyScope: () => mockRestoreScope,
    useScopedHotkeys: (
      ...[keys, callback, , dependencies, options]: Parameters<
        (typeof import('erxes-ui'))['useScopedHotkeys']
      >
    ) =>
      useHotkeys(
        keys,
        callback,
        { enableOnContentEditable: true, ...options },
        dependencies,
      ),
  };
});
jest.mock('ui-modules', () => {
  const { atom, useAtomValue } =
    jest.requireActual<typeof import('jotai')>('jotai');
  const draftState = atom<{
    contentType: string;
    defaults: Record<string, unknown>;
  } | null>(null);
  return {
    CustomersInline: ({ customerIds }: { customerIds: string[] }) => (
      <span>{customerIds.join(',')}</span>
    ),
    CompaniesInline: () => null,
    currentUserState: atom({ _id: 'user-1' }),
    sidePanelDraftState: draftState,
    useSidePanelDraft: () => useAtomValue(draftState)?.defaults || {},
    useSidePanel: () => ({
      back: mockBack,
      close: mockClose,
      canGoBack: true,
      openRecord: mockOpenRecord,
    }),
    isFieldVisibleByLogic: () => true,
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
    PanelFormRow: ({ children }: PropsWithChildren) => <div>{children}</div>,
  };
});
jest.mock('@/channels/hooks/useCanManageChannels', () => ({
  useCanManageChannels: () => () => false,
}));
jest.mock('@/ticket/hooks/useCreateTicket', () => ({
  useCreateTicket: () => ({ createTicket: mockCreateTicket, loading: false }),
}));
jest.mock('@/ticket/hooks/useTicketCreateLayout', () => ({
  useTicketCreateLayout: () => ({
    rows: [
      [
        {
          kind: 'property',
          id: 'property:property',
          field: { _id: 'property', name: 'Custom property' },
        },
      ],
    ],
    rules: { isRequired: () => false },
  }),
}));
jest.mock('@/ticket/components/add-ticket/TicketCreateLayoutRows', () => ({
  TicketCreateLayoutRows: ({
    propertiesData,
    onPropertyChange,
  }: {
    propertiesData: Record<string, unknown>;
    onPropertyChange: (id: string, value: string) => void;
  }) => (
    <input
      aria-label="property"
      value={String(propertiesData.property || '')}
      onChange={(event) => onPropertyChange('property', event.target.value)}
    />
  ),
}));
jest.mock('@/ticket/components/ticket-selects/SelectChannel', () => ({
  SelectChannel: { FormItem: () => <input aria-label="Channel search" /> },
}));
jest.mock('@/ticket/components/ticket-selects/SelectPipeline', () => ({
  SelectPipeline: { FormItem: () => null },
}));
jest.mock('@/ticket/components/ticket-selects/SelectStatusTicket', () => ({
  SelectStatusTicket: { FormItem: () => null },
}));

const initialDraft = {
  contentType: 'frontline:ticket',
  defaults: {
    channelId: 'channel-1',
    pipelineId: 'pipeline-1',
    statusId: 'status-1',
    customerId: 'customer-1',
  },
};
const nextDraft = {
  contentType: 'frontline:ticket',
  defaults: {
    channelId: 'channel-2',
    pipelineId: 'pipeline-2',
    statusId: 'status-2',
    customerId: 'customer-2',
  },
};

const renderForm = (store: ReturnType<typeof createStore>) =>
  render(
    <Provider store={store}>
      <AddTicketForm />
    </Provider>,
  );

const enterValue = (field: string, value: string): void => {
  fireEvent.change(screen.getByLabelText(field), { target: { value } });
};

const submitTicket = async (name: string, expectedCalls = 1): Promise<void> => {
  enterValue('name', name);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() =>
    expect(mockCreateTicket).toHaveBeenCalledTimes(expectedCalls),
  );
};

const setup = () => {
  const store = createStore();
  store.set(sidePanelDraftState, initialDraft);
  const view = renderForm(store);
  return { store, ...view };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockEditor.document = [];
  mockConfirm.mockImplementation(() => new Promise<void>(() => undefined));
});

it('keeps the current name, description, properties and contact when replacement is cancelled', async () => {
  const { store } = setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Unsaved ticket' },
  });
  fireEvent.change(screen.getByLabelText('description'), {
    target: { value: 'Important details' },
  });
  fireEvent.change(screen.getByLabelText('property'), {
    target: { value: 'Custom value' },
  });
  act(() => store.set(sidePanelDraftState, nextDraft));
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Unsaved ticket',
  );
  expect((screen.getByLabelText('property') as HTMLInputElement).value).toBe(
    'Custom value',
  );
  expect(mockEditor.replaceBlocks).not.toHaveBeenCalled();
  expect(screen.getByText('customer-1')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockCreateTicket).toHaveBeenCalled());
  expect(mockCreateTicket.mock.calls[0][0].variables).toMatchObject({
    name: 'Unsaved ticket',
    customerId: 'customer-1',
    channelId: 'channel-1',
  });
});

it.each(['description', 'property'])(
  'requires confirmation when only %s was edited',
  async (field) => {
    const { store } = setup();
    fireEvent.change(screen.getByLabelText(field), {
      target: { value: 'Only unsaved value' },
    });
    act(() => store.set(sidePanelDraftState, nextDraft));
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(screen.getByText('customer-1')).toBeTruthy();
  },
);

it('resets values and accepts the new contact only after confirmation', async () => {
  let approve: () => void = () => undefined;
  mockConfirm.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        approve = resolve;
      }),
  );
  const { store } = setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Discard me' },
  });
  act(() => store.set(sidePanelDraftState, nextDraft));
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
  await act(() => Promise.resolve(approve()));
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe('');
  expect(store.get(sidePanelDraftState)).toEqual(nextDraft);
  expect(screen.getByText('customer-2')).toBeTruthy();
});

it('replaces a pristine draft without prompting', async () => {
  const { store } = setup();
  act(() => store.set(sidePanelDraftState, nextDraft));
  await waitFor(() => expect(screen.getByText('customer-2')).toBeTruthy());
  expect(mockConfirm).not.toHaveBeenCalled();
  expect(store.get(sidePanelDraftState)).toEqual(nextDraft);
});

it('keeps the ticket draft when Escape dismisses a focused select search input', () => {
  setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Keep this draft' },
  });
  const search = screen.getByLabelText('Channel search');
  search.focus();
  fireEvent.keyDown(search, { key: 'Escape', code: 'Escape' });
  fireEvent.keyUp(search, { key: 'Escape', code: 'Escape' });
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Keep this draft',
  );
});

it('restores dirty values, description and custom properties after Activity or another row unmounts the draft', async () => {
  const { store, unmount } = setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Keep my ticket' },
  });
  fireEvent.change(screen.getByLabelText('description'), {
    target: { value: 'Keep my details' },
  });
  fireEvent.change(screen.getByLabelText('property'), {
    target: { value: 'Keep my property' },
  });
  unmount();
  mockEditor.document = [];
  renderForm(store);
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Keep my ticket',
  );
  expect(screen.getByLabelText<HTMLInputElement>('property').value).toBe(
    'Keep my property',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockCreateTicket).toHaveBeenCalled());
  expect(mockCreateTicket.mock.calls[0][0].variables).toMatchObject({
    name: 'Keep my ticket',
    description: JSON.stringify([
      { type: 'paragraph', content: 'Keep my details' },
    ]),
    customerId: 'customer-1',
    channelId: 'channel-1',
    pipelineId: 'pipeline-1',
    statusId: 'status-1',
    propertiesData: { property: 'Keep my property' },
  });
});

it('requires affirmative confirmation before Cancel discards dirty values', () => {
  setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Keep my ticket' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(mockBack).not.toHaveBeenCalled();
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Keep my ticket',
  );
});

it('keeps the draft when Escape dismisses a contenteditable editor', () => {
  setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Keep my ticket' },
  });
  const editor = document.createElement('div');
  editor.contentEditable = 'true';
  screen
    .getByRole('button', { name: 'Save' })
    .parentElement?.appendChild(editor);
  editor.focus();
  fireEvent.keyDown(editor, { key: 'Escape', code: 'Escape' });
  fireEvent.keyUp(editor, { key: 'Escape', code: 'Escape' });
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockClose).not.toHaveBeenCalled();
});

it('keeps a draft when replacement is rejected with Escape', async () => {
  let dismiss: (error: Error) => void = () => undefined;
  mockConfirm.mockImplementation(
    () =>
      new Promise<void>((_resolve, reject) => {
        dismiss = reject;
      }),
  );
  const { store } = setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Keep after Escape' },
  });
  act(() => store.set(sidePanelDraftState, nextDraft));
  await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
  fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
  fireEvent.keyUp(document.body, { key: 'Escape', code: 'Escape' });
  await act(() => Promise.resolve(dismiss(new Error('Dismissed'))));
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Keep after Escape',
  );
  expect(screen.getByText('customer-1')).toBeTruthy();
  expect(mockBack).not.toHaveBeenCalled();
  expect(mockClose).not.toHaveBeenCalled();
});

it('does not replace a newer accepted draft when an earlier create completes', async () => {
  mockConfirm.mockImplementation(() => Promise.resolve());
  const { store, unmount } = setup();
  await submitTicket('Old submitted ticket');
  act(() => store.set(sidePanelDraftState, nextDraft));
  await waitFor(() => expect(screen.getByText('customer-2')).toBeTruthy());
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'New accepted ticket' },
  });
  act(() =>
    mockCreateTicket.mock.calls[0][0].onCompleted({
      createTicket: { _id: 'created-old' },
    }),
  );
  expect(mockOpenRecord).not.toHaveBeenCalled();
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'New accepted ticket',
  );
  unmount();
  renderForm(store);
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(screen.getByText('customer-2')).toBeTruthy();
});

it('clears an explicitly discarded draft before it is reopened', async () => {
  mockConfirm.mockImplementation(() => Promise.resolve());
  const { store, unmount } = setup();
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Discard this' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  unmount();
  renderForm(store);
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe('');
});

it('keeps ticket drafts separate when the signed-in user changes', () => {
  const { store } = setup();
  const firstUser = store.get(currentUserState);
  if (!firstUser) throw new Error('Expected signed-in fixture');
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'First user ticket' },
  });
  act(() => store.set(currentUserState, { ...firstUser, _id: 'user-2' }));
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe('');
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Second user ticket' },
  });
  act(() => store.set(currentUserState, firstUser));
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'First user ticket',
  );
});

it('keeps a slow create pending across same-default remounts and preserves newer edits against original defaults', async () => {
  const { store, unmount } = setup();
  await submitTicket('Submitted ticket');
  unmount();
  const reopened = renderForm(store);
  const form = screen.getByLabelText('name').closest('form');
  if (!form) throw new Error('Expected ticket form');
  await act(async () => {
    fireEvent.submit(form);
    await Promise.resolve();
  });
  expect(mockCreateTicket).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
  ).toBe(true);
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Newer ticket edits' },
  });
  act(() =>
    mockCreateTicket.mock.calls[0][0].onCompleted({
      createTicket: { _id: 'created-first' },
    }),
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
  ).toBe(false);
  expect(mockOpenRecord).not.toHaveBeenCalled();
  reopened.unmount();
  renderForm(store);
  expect(mockConfirm).not.toHaveBeenCalled();
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Newer ticket edits',
  );
});

it('routes only the current remounted owner when an untouched pending create completes', async () => {
  const { store, unmount } = setup();
  await submitTicket('Submitted ticket');
  unmount();
  renderForm(store);
  act(() =>
    mockCreateTicket.mock.calls[0][0].onCompleted({
      createTicket: { _id: 'created-first' },
    }),
  );
  expect(mockOpenRecord).toHaveBeenCalledTimes(1);
  expect(mockOpenRecord).toHaveBeenCalledWith(
    { contentType: 'frontline:ticket', contentId: 'created-first' },
    { replace: true },
  );
});

it('does not acknowledge an affirmatively discarded same-default session when its old request completes', async () => {
  mockConfirm.mockImplementation(() => Promise.resolve());
  const { store, unmount } = setup();
  await submitTicket('Old submitted ticket');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  unmount();
  const reopened = renderForm(store);
  await submitTicket('New same-context ticket', 2);
  act(() =>
    mockCreateTicket.mock.calls[0][0].onCompleted({
      createTicket: { _id: 'discarded-create' },
    }),
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
  ).toBe(true);
  expect(mockOpenRecord).not.toHaveBeenCalled();
  reopened.unmount();
  renderForm(store);
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'New same-context ticket',
  );
  act(() =>
    mockCreateTicket.mock.calls[1][0].onCompleted({
      createTicket: { _id: 'new-create' },
    }),
  );
  expect(mockOpenRecord).toHaveBeenCalledTimes(1);
  expect(mockOpenRecord).toHaveBeenCalledWith(
    { contentType: 'frontline:ticket', contentId: 'new-create' },
    { replace: true },
  );
});

it('releases a failed remounted create for an explicit retry without replacing its draft', async () => {
  const { store, unmount } = setup();
  await submitTicket('Retry this ticket');
  unmount();
  renderForm(store);
  act(() =>
    mockCreateTicket.mock.calls[0][0].onError(new Error('Save unavailable')),
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
  ).toBe(false);
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'Retry this ticket',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockCreateTicket).toHaveBeenCalledTimes(2));
});

it('keeps an affirmatively replaced draft in the same channel and contact separate from its old pending request', async () => {
  mockConfirm.mockImplementation(() => Promise.resolve());
  const { store, unmount } = setup();
  await submitTicket('Old submitted ticket');
  const replacement = {
    ...initialDraft,
    defaults: { ...initialDraft.defaults, name: 'Replacement default' },
  };
  act(() => store.set(sidePanelDraftState, replacement));
  await waitFor(() =>
    expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
      'Replacement default',
    ),
  );
  unmount();
  const reopened = renderForm(store);
  await submitTicket('New same-context edits', 2);
  act(() =>
    mockCreateTicket.mock.calls[0][0].onCompleted({
      createTicket: { _id: 'replaced-create' },
    }),
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
  ).toBe(true);
  expect(mockOpenRecord).not.toHaveBeenCalled();
  reopened.unmount();
  renderForm(store);
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText<HTMLInputElement>('name').value).toBe(
    'New same-context edits',
  );
  expect(screen.getByText('customer-1')).toBeTruthy();
});
