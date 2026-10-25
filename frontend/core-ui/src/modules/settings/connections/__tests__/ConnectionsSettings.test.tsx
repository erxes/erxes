/** @jest-environment jsdom */
import './jsdomPolyfills';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { IconsProvider, Toaster } from 'erxes-ui';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import {
  currentUserPermissionsState,
  ICurrentUserPermission,
  isPermissionsLoadedState,
} from 'ui-modules';
import { ConnectionsSettings } from '@/settings/connections/components/ConnectionsSettings';
import {
  CONNECTIONS,
  CONNECTIONS_ADD,
  CONNECTIONS_EDIT,
  CONNECTIONS_REMOVE,
  CONNECTIONS_TEST,
  CONNECTIONS_TYPES,
} from '@/settings/connections/graphql';

// The rich-text email editor erxes-ui bundles cannot load under jest and is
// not used by this page.
jest.mock('../../../../../../libs/erxes-ui/src/modules/email-editor', () => ({}));

const customType = {
  __typename: 'ConnectionType',
  id: 'core:custom',
  pluginName: 'core',
  label: 'Custom',
  description: 'Your own keys and values.',
  icon: 'IconPlug',
  allowCustomFields: true,
  hasTest: false,
  fields: [],
};

const field = (overrides: Record<string, unknown>) => ({
  __typename: 'ConnectionTypeField',
  description: null,
  placeholder: null,
  required: false,
  secret: false,
  inputType: null,
  pattern: null,
  minLength: null,
  maxLength: null,
  ...overrides,
});

const aiType = {
  __typename: 'ConnectionType',
  id: 'ai:provider',
  pluginName: 'ai',
  label: 'AI provider',
  description: null,
  icon: 'IconSparkles',
  allowCustomFields: false,
  hasTest: true,
  fields: [
    field({ key: 'baseUrl', label: 'Base URL', required: true, inputType: 'url' }),
    field({ key: 'apiKey', label: 'API key', required: true, secret: true }),
  ],
};

const connection = (overrides: Record<string, unknown> = {}) => ({
  __typename: 'Connection',
  _id: 'c1',
  name: 'OpenAI',
  icon: 'IconSparkles',
  logo: null,
  type: 'ai:provider',
  typeLabel: 'AI provider',
  typeAvailable: true,
  hasTest: true,
  status: 'ready',
  fields: [
    {
      __typename: 'ConnectionField',
      key: 'baseUrl',
      label: 'Base URL',
      secret: false,
      value: 'https://api.openai.com/v1',
      hasValue: true,
    },
    {
      __typename: 'ConnectionField',
      key: 'apiKey',
      label: 'API key',
      secret: true,
      value: null,
      hasValue: true,
    },
  ],
  lastTestedAt: null,
  lastTestStatus: null,
  lastTestMessage: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-02T00:00:00.000Z',
  ...overrides,
});

const typesMock: MockedResponse = {
  request: { query: CONNECTIONS_TYPES },
  result: { data: { connectionsTypes: [customType, aiType] } },
  maxUsageCount: 10,
};

const listMock = (connections: unknown[], maxUsageCount = 1): MockedResponse => ({
  request: { query: CONNECTIONS, variables: {} },
  result: { data: { connections } },
  maxUsageCount,
});

const MANAGE: ICurrentUserPermission[] = [
  {
    plugin: 'core',
    module: 'connections',
    actions: ['showConnections', 'manageConnections'],
    scope: 'all',
  },
];

const renderPage = (
  mocks: MockedResponse[],
  permissions: ICurrentUserPermission[] = MANAGE,
) => {
  const store = createStore();

  store.set(currentUserPermissionsState, permissions);
  store.set(isPermissionsLoadedState, true);

  return render(
    <JotaiProvider store={store}>
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <IconsProvider>
            <>
              <ConnectionsSettings />
              <Toaster />
            </>
          </IconsProvider>
        </MemoryRouter>
      </MockedProvider>
    </JotaiProvider>,
  );
};

const openEdit = async (name = 'OpenAI') => {
  fireEvent.click(await screen.findByRole('button', { name: `Edit ${name}` }));
  return screen.findByRole('dialog', { name: 'Edit connection' });
};

const typeInto = (element: HTMLElement, value: string) =>
  fireEvent.change(element, { target: { value } });

describe('Settings → Connections', () => {
  it('lists each connection with its icon or logo, name, type and status', async () => {
    renderPage([
      typesMock,
      listMock([
        connection(),
        connection({
          _id: 'c2',
          name: 'Mail',
          icon: null,
          logo: 'logos/mail.png',
          type: 'core:custom',
          typeLabel: 'Custom',
          hasTest: false,
          status: 'verified',
          fields: [],
        }),
      ]),
    ]);

    const openai = (await screen.findByText('OpenAI')).closest('tr') as HTMLElement;
    const mail = screen.getByText('Mail').closest('tr') as HTMLElement;

    expect(within(openai).getByText('AI provider')).toBeTruthy();
    expect(within(openai).getByText('Not tested')).toBeTruthy();
    expect(openai.querySelector('svg')).toBeTruthy();
    expect(within(mail).getByText('Custom')).toBeTruthy();
    expect(within(mail).getByText('Verified')).toBeTruthy();
    expect(within(mail).getByRole('img').getAttribute('src')).toContain(
      encodeURIComponent('logos/mail.png'),
    );
  });

  it('shows a loading state, then an empty state', async () => {
    renderPage([typesMock, listMock([])]);

    expect(screen.getByRole('status', { name: 'Loading connections' })).toBeTruthy();
    expect(await screen.findByText('No connections yet')).toBeTruthy();
    expect(screen.queryByRole('status', { name: 'Loading connections' })).toBeNull();
  });

  it('shows an error with a retry', async () => {
    renderPage([
      typesMock,
      { request: { query: CONNECTIONS, variables: {} }, error: new Error('Gateway down') },
      listMock([connection()]),
    ]);

    expect(await screen.findByText('Could not load connections')).toBeTruthy();
    expect(screen.getByText('Gateway down')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('OpenAI')).toBeTruthy();
  });

  it('requires a name and an icon or logo before creating', async () => {
    renderPage([typesMock, listMock([])]);

    fireEvent.click(await screen.findByRole('button', { name: 'Add connection' }));
    const sheet = await screen.findByRole('dialog', { name: 'Add connection' });

    fireEvent.click(within(sheet).getByRole('button', { name: 'Create' }));

    expect(await within(sheet).findByText('Name is required')).toBeTruthy();
    expect(within(sheet).getByText('Choose an icon or upload a logo')).toBeTruthy();
    expect(screen.queryByText('Connection created')).toBeNull();
  });

  it('creates a custom connection with plain and secret keys, then lists it', async () => {
    const created = connection({
      _id: 'c9',
      name: 'SMTP',
      icon: 'IconPlug',
      type: 'core:custom',
      typeLabel: 'Custom',
      hasTest: false,
      fields: [],
    });

    renderPage([
      typesMock,
      listMock([]),
      {
        request: {
          query: CONNECTIONS_ADD,
          variables: {
            input: {
              name: 'SMTP',
              icon: 'IconPlug',
              type: 'core:custom',
              fields: [
                { key: 'host', secret: false, value: 'smtp.example.com' },
                { key: 'password', secret: true, value: 's3cret' },
              ],
            },
          },
        },
        result: { data: { connectionsAdd: created } },
      },
      listMock([created]),
    ]);

    fireEvent.click(await screen.findByRole('button', { name: 'Add connection' }));
    const sheet = await screen.findByRole('dialog', { name: 'Add connection' });

    typeInto(within(sheet).getByLabelText('Name'), 'SMTP');
    fireEvent.click(within(sheet).getByRole('combobox', { name: 'Choose an icon' }));
    const plug = (await screen.findAllByRole('option')).find(
      (option) => option.getAttribute('data-value')?.toLowerCase() === 'iconplug',
    );
    fireEvent.click(plug as HTMLElement);

    fireEvent.click(within(sheet).getByRole('button', { name: 'Add field' }));
    fireEvent.click(within(sheet).getByRole('button', { name: 'Add field' }));
    const keys = within(sheet).getAllByLabelText('Key');
    const values = within(sheet).getAllByLabelText('Value');

    typeInto(keys[0], 'host');
    typeInto(values[0], 'smtp.example.com');
    typeInto(keys[1], 'password');
    fireEvent.click(within(sheet).getAllByRole('switch', { name: 'Secret' })[1]);
    typeInto(within(sheet).getAllByLabelText('Value')[1], 's3cret');
    expect(within(sheet).getAllByLabelText('Value')[1].getAttribute('type')).toBe(
      'password',
    );

    fireEvent.click(within(sheet).getByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Connection created')).toBeTruthy();
    expect(await screen.findByText('SMTP')).toBeTruthy();
  });

  it('renders the type’s fields and never prefills a saved secret', async () => {
    renderPage([typesMock, listMock([connection()])]);

    const sheet = await openEdit();

    expect((within(sheet).getByLabelText('Base URL') as HTMLInputElement).value).toBe(
      'https://api.openai.com/v1',
    );
    expect(within(sheet).getByText('Saved')).toBeTruthy();
    expect(within(sheet).getByRole('button', { name: 'Replace API key' })).toBeTruthy();
    expect(within(sheet).queryByLabelText('API key')).toBeNull();
  });

  it('keeps a saved secret unless it is replaced', async () => {
    const saveWith = (apiKey: Record<string, string>) => ({
      request: {
        query: CONNECTIONS_EDIT,
        variables: {
          _id: 'c1',
          input: {
            name: 'OpenAI',
            icon: 'IconSparkles',
            logo: '',
            fields: [
              { key: 'baseUrl', value: 'https://api.openai.com/v1' },
              { key: 'apiKey', ...apiKey },
            ],
          },
        },
      },
      result: { data: { connectionsEdit: connection() } },
    });

    renderPage([typesMock, listMock([connection()]), saveWith({}), saveWith({ value: 'sk-new' })]);

    // A save that does not match the expected input fails and keeps the
    // sheet open with an error; a matching one closes it.
    const saved = async () => {
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: 'Edit connection' })).toBeNull(),
      );
      expect(screen.queryByText('Could not save the connection')).toBeNull();
    };

    let sheet = await openEdit();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Save' }));
    await saved();

    sheet = await openEdit();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Replace API key' }));
    const secret = within(sheet).getByLabelText('API key') as HTMLInputElement;

    expect(secret.value).toBe('');
    expect(secret.getAttribute('type')).toBe('password');
    typeInto(secret, 'sk-new');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Save' }));
    await saved();
  });

  it('validates the type’s fields', async () => {
    renderPage([typesMock, listMock([connection()])]);

    const sheet = await openEdit();
    const baseUrl = within(sheet).getByLabelText('Base URL');

    typeInto(baseUrl, '');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Save' }));
    expect(await within(sheet).findByText('Base URL is required')).toBeTruthy();

    typeInto(baseUrl, 'not a url');
    fireEvent.click(within(sheet).getByRole('button', { name: 'Save' }));
    expect(await within(sheet).findByText('Base URL must be a valid URL')).toBeTruthy();
  });

  it('tests a connection and shows the result', async () => {
    renderPage([
      typesMock,
      listMock([connection()]),
      {
        request: { query: CONNECTIONS_TEST, variables: { _id: 'c1' } },
        result: {
          data: {
            connectionsTest: {
              __typename: 'ConnectionTestResult',
              ok: true,
              message: 'Models listed',
              connection: connection({ status: 'verified', lastTestStatus: 'success' }),
            },
          },
        },
      },
    ]);

    const sheet = await openEdit();

    fireEvent.click(within(sheet).getByRole('button', { name: 'Test connection' }));

    expect(await screen.findByText('Connection works')).toBeTruthy();
    expect(screen.getByText('Models listed')).toBeTruthy();
    fireEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }));
    const row = (await screen.findByRole('button', { name: 'Edit OpenAI' })).closest('tr') as HTMLElement;
    expect(within(row).getByText('Verified')).toBeTruthy();
  });

  it('offers no test for types without one', async () => {
    renderPage([
      typesMock,
      listMock([
        connection({ type: 'core:custom', typeLabel: 'Custom', hasTest: false, fields: [] }),
      ]),
    ]);

    const sheet = await openEdit();

    expect(within(sheet).queryByRole('button', { name: 'Test connection' })).toBeNull();
  });

  it('deletes a connection after confirmation', async () => {
    renderPage([
      typesMock,
      listMock([connection()]),
      {
        request: { query: CONNECTIONS_REMOVE, variables: { _id: 'c1' } },
        result: { data: { connectionsRemove: 'c1' } },
      },
      listMock([]),
    ]);

    const sheet = await openEdit();

    fireEvent.click(within(sheet).getByRole('button', { name: 'Delete' }));
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    });

    expect(await screen.findByText('Connection deleted')).toBeTruthy();
    expect(await screen.findByText('No connections yet')).toBeTruthy();
  });

  it('hides changes from users who may only view connections', async () => {
    renderPage(
      [typesMock, listMock([connection()])],
      [
        {
          plugin: 'core',
          module: 'connections',
          actions: ['showConnections'],
          scope: 'all',
        },
      ],
    );

    expect(await screen.findByText('OpenAI')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add connection' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit OpenAI' })).toBeNull();
  });
});
