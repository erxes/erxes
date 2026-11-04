import { flushProviderUpdates } from './fixtures/providerUi';
import type { PropsWithChildren } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { MailIntegrationPanelForm } from '../mail/components/MailIntegrationForm';
import { FacebookIntegrationSetup } from '../facebook/components/FacebookIntegrationSetup';
import { DiscordIntegrationPanelForm } from '../discord/components/DiscordIntegrationDetail';
import { toast } from 'erxes-ui';
import {
  clearIntegrationDrafts,
  IntegrationDraftContext,
} from '../hooks/useIntegrationDraft';
import { FacebookGetAccounts } from '../facebook/components/FacebookGetAccounts';

jest.mock('../components/IntegrationSteps', () => ({
  IntegrationSteps: () => null,
}));
const mockAdd = jest.fn();
const mockClose = jest.fn();
const mockReadiness = jest.fn();
const mockOpen = jest.fn();
const mockRetryReadiness = jest.fn();
const mockRefetchPresets = jest.fn().mockResolvedValue({});
jest.mock('../discord/hooks/useDiscordSetup', () => ({
  useDiscordValidateToken: () => ({
    validate: jest.fn(),
    validation: { valid: true, applicationId: 'app' },
    loading: false,
  }),
  useDiscordGuilds: () => ({ guilds: [], loading: false }),
  useDiscordGuildChannels: () => ({ channels: [], loading: false }),
  useDiscordBotChannels: () => ({
    channels: [
      { id: 'a', name: 'first' },
      { id: 'b', name: 'second' },
    ],
    loading: false,
  }),
  useDiscordConnectedServers: () => ({
    connectedServers: [{ botId: 'bot', guildId: 'guild', guildName: 'Guild' }],
  }),
  useDiscordTakenChannels: () => ({ takenChannelIds: [] }),
  useDiscordNamePresets: () => ({
    namePresets: [],
    refetch: mockRefetchPresets,
  }),
}));
jest.mock('../hooks/useIntegrationAdd', () => ({
  useIntegrationAdd: () => ({ addIntegration: mockAdd, loading: false }),
}));
jest.mock('../hooks/useIntegrationDetail', () => ({
  useIntegrationDetail: () => ({ loading: false }),
}));
jest.mock('../mail/hooks/useMailSendingReadiness', () => ({
  useMailSendingReadiness: () => mockReadiness(),
}));
jest.mock('../mail/components/MailSendingRequired', () => ({
  MailSendingRequired: () => <p>Sending unavailable</p>,
}));
jest.mock('../facebook/contexts/FbIntegrationContext', () => ({
  useFbIntegrationContext: () => ({ isPost: false }),
}));
jest.mock('../facebook/components/FacebookIntegrationForm', () => ({
  FacebookIntegrationFormLayout: ({
    children,
    actions,
  }: PropsWithChildren<{ actions: React.ReactNode }>) => (
    <>
      {children}
      {actions}
    </>
  ),
  FacebookIntegrationFormSteps: () => null,
}));
jest.mock('../facebook/hooks/useFacebookAccounts', () => ({
  useFacebookAccounts: () => ({
    facebookGetAccounts: [],
    loading: false,
    refetch: jest.fn(),
  }),
}));
jest.mock('../facebook/hooks/useFacebookPages', () => ({
  useFacebookPages: () => ({ facebookGetPages: [], loading: false }),
}));
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'channel-a' }),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      typeof fallback === 'string' ? fallback : key,
  }),
}));
jest.mock('ui-modules', () => {
  const { BrandInput, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  return {
    useSidePanel: () => ({ close: mockClose }),
    PanelFormRow: Wrap,
    SelectBrand: BrandInput,
    SelectBrands: { FormItem: BrandInput },
  };
});
jest.mock('erxes-ui', () => {
  const { createProviderUi, createSelectableUi, Wrap } = jest.requireActual<
    typeof import('./fixtures/providerUi')
  >('./fixtures/providerUi');
  const Select = createSelectableUi();
  const NameInput = ({
    value,
    onValueChange,
  }: {
    value: string;
    onValueChange: (value: string) => void;
  }) => (
    <input
      aria-label="name"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  );
  return {
    ...createProviderUi(),
    Sheet: Object.assign(Wrap, { Content: Wrap, Footer: Wrap, Close: Wrap }),
    Alert: Object.assign(Wrap, { Title: Wrap, Description: Wrap }),
    Command: Object.assign(Wrap, {
      Primitive: { Input: Wrap },
      List: Wrap,
      Input: NameInput,
      Item: Wrap,
      Group: Wrap,
    }),
    Popover: Object.assign(Wrap, { Content: Wrap }),
    Combobox: { Trigger: Wrap, Content: Wrap, Value: Wrap, Check: Wrap },
    Select,
    MultipleSelector: ({ value }: { value: { value: string }[] }) => (
      <output aria-label="selected-channels">
        {value.map((item) => item.value).join(',')}
      </output>
    ),
    RadioGroup: Wrap,
    Spinner: () => <span>Loading</span>,
    toast: jest.fn(),
    useConfirm: () => ({ confirm: () => Promise.resolve() }),
    isDeeplyEqual: (a: unknown, b: unknown) =>
      JSON.stringify(a) === JSON.stringify(b),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockReadiness.mockReturnValue({
    readiness: { ready: true, platform: { domain: 'example.com' } },
    loading: false,
  });
  mockAdd.mockResolvedValue({});
  jest.spyOn(window, 'open').mockImplementation(mockOpen);
  mockOpen.mockReturnValue(null);
});
afterEach(() => jest.restoreAllMocks());

const fillBasics = () => {
  fireEvent.change(screen.getByLabelText('name'), {
    target: { value: 'Support' },
  });
  fireEvent.change(screen.getByLabelText('brandId'), {
    target: { value: 'brand' },
  });
};
const submitForm = () => {
  const form = document.querySelector('form');
  if (!form) throw new Error('Form missing');
  fireEvent.submit(form);
};

/** Opens one scoped Mail draft without recreating its Jotai session. */
const renderMailDraft = (
  store: ReturnType<typeof createStore>,
  context: string,
) =>
  render(
    <Provider store={store}>
      <IntegrationDraftContext.Provider value={context}>
        <MailIntegrationPanelForm />
      </IntegrationDraftContext.Provider>
    </Provider>,
  );

it('mail Enter cannot create before the sending confirmation step', async () => {
  render(
    <Provider store={createStore()}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  fillBasics();
  await flushProviderUpdates(() => submitForm());
  expect(mockAdd).not.toHaveBeenCalled();
});
it('mail submit requires confirmed sending readiness even when the form submits directly', async () => {
  mockReadiness.mockReturnValue({ readiness: null, loading: false });
  render(
    <Provider store={createStore()}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  fillBasics();
  fireEvent.click(screen.getByRole('button', { name: 'next-step' }));
  fireEvent.click(screen.getByRole('button', { name: 'next-step' }));
  await flushProviderUpdates(() => submitForm());
  expect(mockAdd).not.toHaveBeenCalled();
});
it('Facebook keeps its inputs and panel open when mutation resolves without a created record', async () => {
  render(
    <Provider store={createStore()}>
      <FacebookIntegrationSetup />
    </Provider>,
  );
  fillBasics();
  submitForm();
  await waitFor(() => expect(mockAdd).toHaveBeenCalledTimes(1));
  expect(mockClose).not.toHaveBeenCalled();
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Support',
  );
});
it('blocked Facebook login can be retried immediately', () => {
  render(
    <Provider store={createStore()}>
      <FacebookGetAccounts />
    </Provider>,
  );
  fireEvent.click(
    screen.getByRole('button', { name: 'connect-facebook-account' }),
  );
  expect(
    screen
      .getByRole('button', { name: 'connect-facebook-account' })
      .hasAttribute('disabled'),
  ).toBe(false);
});

it('mail restores a draft after closing and reopening the same context', () => {
  const store = createStore();
  const first = render(
    <Provider store={store}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  fillBasics();
  first.unmount();
  render(
    <Provider store={store}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Support',
  );
});

it('Discord retains a typed secret only in memory across reopening', () => {
  const store = createStore();
  const first = render(
    <Provider store={store}>
      <DiscordIntegrationPanelForm />
    </Provider>,
  );
  fireEvent.change(screen.getByLabelText('Bot token'), {
    target: { value: 'secret-token' },
  });
  first.unmount();
  render(
    <Provider store={store}>
      <DiscordIntegrationPanelForm />
    </Provider>,
  );
  expect((screen.getByLabelText('Bot token') as HTMLInputElement).value).toBe(
    'secret-token',
  );
  expect(JSON.stringify(localStorage)).not.toContain('secret-token');
  expect(JSON.stringify(sessionStorage)).not.toContain('secret-token');
});
it('Discord retries only unfinished channels after a partial resolved-empty failure and reopening', async () => {
  mockAdd
    .mockResolvedValueOnce({
      data: { integrationsCreateExternalIntegration: { _id: 'created-a' } },
    })
    .mockResolvedValueOnce({});
  const store = createStore();
  const first = render(
    <Provider store={store}>
      <DiscordIntegrationPanelForm />
    </Provider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Guild' }));
  fireEvent.click(screen.getByRole('button', { name: 'Select all' }));
  fillBasics();
  await flushProviderUpdates(() => submitForm());
  expect(mockClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText('selected-channels').textContent).toBe('b');
  first.unmount();
  render(
    <Provider store={store}>
      <DiscordIntegrationPanelForm />
    </Provider>,
  );
  expect(screen.getByLabelText('selected-channels').textContent).toBe('b');
  mockAdd.mockResolvedValue({
    data: { integrationsCreateExternalIntegration: { _id: 'created-b' } },
  });
  await flushProviderUpdates(() => submitForm());
  expect(mockAdd).toHaveBeenCalledTimes(3);
  expect(mockAdd.mock.calls[2][0].variables.data.channelId).toBe('b');
  expect(mockClose).toHaveBeenCalledTimes(1);
});
it('Mail readiness errors expose a retry and retain the entered basics', () => {
  mockReadiness.mockReturnValue({
    readiness: null,
    loading: false,
    error: new Error('Readiness offline'),
    refetch: mockRetryReadiness.mockResolvedValue({}),
  });
  render(
    <Provider store={createStore()}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  fillBasics();
  fireEvent.click(screen.getByRole('button', { name: 'next-step' }));
  fireEvent.click(screen.getByRole('button', { name: 'next-step' }));
  expect(screen.getByText('Readiness offline')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mockRetryReadiness).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('button', { name: 'previous-step' }));
  fireEvent.click(screen.getByRole('button', { name: 'previous-step' }));
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Support',
  );
});
it('provider draft keys isolate users and channel create contexts', () => {
  const store = createStore();
  const first = renderMailDraft(store, 'user-a:channel-a');
  fillBasics();
  first.unmount();
  const second = renderMailDraft(store, 'user-b:channel-a');
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe('');
  second.unmount();
  const third = renderMailDraft(store, 'user-a:channel-b');
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe('');
  third.unmount();
  renderMailDraft(store, 'user-a:channel-a');
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Support',
  );
});

it('Mail can retry a resolved-empty create and never repeats a confirmed creation', async () => {
  const store = createStore();
  const first = render(
    <Provider store={store}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  fillBasics();
  fireEvent.click(screen.getByRole('button', { name: 'next-step' }));
  fireEvent.click(screen.getByRole('button', { name: 'next-step' }));
  await flushProviderUpdates(() => submitForm());
  expect(mockClose).not.toHaveBeenCalled();
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({ variant: 'destructive' }),
  );
  mockAdd.mockResolvedValue({
    data: { integrationsCreateExternalIntegration: { _id: 'mail-new' } },
  });
  await flushProviderUpdates(() => submitForm());
  expect(screen.getByRole('button', { name: 'done' })).toBeTruthy();
  first.unmount();
  render(
    <Provider store={store}>
      <MailIntegrationPanelForm />
    </Provider>,
  );
  await flushProviderUpdates(() => submitForm());
  expect(mockAdd).toHaveBeenCalledTimes(2);
  expect(screen.getByRole('button', { name: 'done' })).toBeTruthy();
});
it('deleting one integration draft leaves other record drafts intact', () => {
  const store = createStore();
  const first = renderMailDraft(store, 'record-a');
  fillBasics();
  first.unmount();
  const second = renderMailDraft(store, 'record-b');
  fillBasics();
  second.unmount();
  clearIntegrationDrafts(store, (key) => key === 'record-a');
  const deleted = renderMailDraft(store, 'record-a');
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe('');
  deleted.unmount();
  renderMailDraft(store, 'record-b');
  expect((screen.getByLabelText('name') as HTMLInputElement).value).toBe(
    'Support',
  );
});
