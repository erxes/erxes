import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ConnectionAppAccess } from '../components/ConnectionAppAccess';
import type { CredentialGrant } from '../types';

const TOKEN = 'synthetic-private-app-access-key';
const renderAccess = ({
  canManage = true,
  holdMutation = false,
  failMutation = false,
}: {
  canManage?: boolean;
  holdMutation?: boolean;
  failMutation?: boolean;
} = {}) => {
  const requests: { name: string; variables: Record<string, unknown> }[] = [];
  let grants: CredentialGrant[] = [];
  let finish: () => void = () => undefined;
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    connectToDevTools: true,
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          requests.push({
            name: operation.operationName,
            variables: operation.variables,
          });
          if (operation.operationName === 'credentialsWorkspaceGrants') {
            observer.next({ data: { credentialsGrants: grants } });
            observer.complete();
            return;
          }
          const complete = () => {
            if (failMutation) {
              observer.error(new Error(`synthetic-upstream-error-${TOKEN}`));
              return;
            }
            if (operation.operationName === 'credentialsWorkspaceGrantCreate') {
              const grant = {
                _id: 'grant-a',
                credentialId: 'connection-a',
                pluginName: String(operation.variables.pluginName),
                name: String(operation.variables.name),
                createdAt: '2026-10-22T00:00:00Z',
                revokedAt: null,
              };
              grants.push(grant);
              observer.next({
                data: { credentialsGrantCreate: { token: TOKEN, grant } },
              });
            } else {
              grants = grants.map((grant) => ({
                ...grant,
                revokedAt: '2026-10-22T01:00:00Z',
              }));
              observer.next({ data: { credentialsGrantRevoke: true } });
            }
            observer.complete();
          };
          if (holdMutation) finish = complete;
          else complete();
        }),
    ),
  });
  const ui = (manage: boolean) => (
    <ApolloProvider client={client}>
      <ConnectionAppAccess
        credentialId="connection-a"
        connectionName="Production OpenAI"
        reference="cred_test-reference"
        canManage={manage}
      />
    </ApolloProvider>
  );
  return {
    ...render(ui(canManage)),
    client,
    requests,
    flush: () => finish(),
    ui,
  };
};

const chooseSales = async () => {
  const picker = await screen.findByRole('combobox');
  await waitFor(() => expect(picker.hasAttribute('disabled')).toBe(false));
  fireEvent.keyDown(picker, { key: 'Enter' });
  fireEvent.click(
    await screen.findByRole('option', { name: 'Sales', exact: true }),
  );
};

describe('guided app access', () => {
  it('replaces manual plugin/grant fields with an app picker and clearly explains the remaining developer setup', async () => {
    const { unmount, client } = renderAccess();
    await chooseSales();
    expect(screen.queryByLabelText('Plugin name')).toBeNull();
    expect(screen.queryByLabelText('Grant name')).toBeNull();
    expect(
      screen.getByText('A developer needs to finish app setup'),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Create setup instructions' }),
    ).toBeTruthy();
    unmount();
    client.stop();
  });

  it('generates access names, copies a complete private setup, and never caches the one-time key in the host client', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const { requests, client, unmount } = renderAccess();
    await chooseSales();
    fireEvent.click(
      screen.getByRole('button', { name: 'Create setup instructions' }),
    );
    await screen.findByRole('heading', {
      name: 'One last step: connect the app',
    });
    expect(
      requests.find(
        (request) => request.name === 'credentialsWorkspaceGrantCreate',
      )?.variables,
    ).toEqual({
      credentialId: 'connection-a',
      pluginName: 'sales',
      name: 'Sales connection access',
    });
    expect(document.body.textContent).not.toContain(TOKEN);
    expect(JSON.stringify(client.cache.extract())).not.toContain(TOKEN);
    fireEvent.click(screen.getByRole('button', { name: 'Copy setup details' }));
    await screen.findByRole('button', { name: 'Copy setup details again' });
    expect(writeText.mock.calls[0][0]).toContain(TOKEN);
    expect(writeText.mock.calls[0][0]).toContain('cred_test-reference');
    expect(writeText.mock.calls[0][0]).toContain('getCredentialValues()');
    fireEvent.click(
      screen.getByRole('button', { name: 'I’ve saved the setup details' }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.body.innerHTML).not.toContain(TOKEN);
    expect(
      screen.getByText('Access allowed · app setup may still be needed'),
    ).toBeTruthy();
    unmount();
    client.stop();
  });

  it('does not show one-time keys that arrive after permission loss', async () => {
    const { rerender, ui, flush, unmount, client } = renderAccess({
      holdMutation: true,
    });
    await chooseSales();
    fireEvent.click(
      screen.getByRole('button', { name: 'Create setup instructions' }),
    );
    await screen.findByRole('button', { name: 'Preparing…' });
    rerender(ui(false));
    await act(async () => {
      flush();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.innerHTML).not.toContain(TOKEN);
    expect(screen.getByText(/Ask your workspace administrator/)).toBeTruthy();
    unmount();
    client.stop();
  });

  it('keeps read-only users out of setup actions', async () => {
    const { requests, unmount, client } = renderAccess({ canManage: false });
    await screen.findByText(/Ask your workspace administrator/);
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(
      requests.every(
        (request) => request.name === 'credentialsWorkspaceGrants',
      ),
    ).toBe(true);
    unmount();
    client.stop();
  });

  it('keeps failed setup retryable without exposing upstream errors', async () => {
    const { unmount, client } = renderAccess({ failMutation: true });
    await chooseSales();
    fireEvent.click(
      screen.getByRole('button', { name: 'Create setup instructions' }),
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'Create setup instructions' })
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.innerHTML).not.toContain(TOKEN);
    unmount();
    client.stop();
  });

  it('discards a late key even if permission was lost and restored before the response', async () => {
    const { rerender, ui, flush, unmount, client } = renderAccess({
      holdMutation: true,
    });
    await chooseSales();
    fireEvent.click(
      screen.getByRole('button', { name: 'Create setup instructions' }),
    );
    await screen.findByRole('button', { name: 'Preparing…' });
    rerender(ui(false));
    rerender(ui(true));
    await act(async () => {
      flush();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.innerHTML).not.toContain(TOKEN);
    unmount();
    client.stop();
  });

  it('requires confirmation before removing access and preserves the connection', async () => {
    const { requests, client, unmount } = renderAccess();
    await chooseSales();
    fireEvent.click(
      screen.getByRole('button', { name: 'Create setup instructions' }),
    );
    await screen.findByRole('heading', {
      name: 'One last step: connect the app',
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'I’ve saved the setup details' }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove access' }),
    );
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(
      requests.some(
        (request) => request.name === 'credentialsWorkspaceGrantRevoke',
      ),
    ).toBe(false);
    const confirm = screen
      .getAllByRole('button', { name: 'Remove access' })
      .find((button) => button.closest('[role="alertdialog"]'));
    if (!confirm) throw new Error('Confirmation button missing');
    fireEvent.click(confirm);
    expect(await screen.findByText('Access removed')).toBeTruthy();
    expect(
      requests.filter(
        (request) => request.name === 'credentialsWorkspaceGrantRevoke',
      ),
    ).toHaveLength(1);
    expect(
      requests.some((request) => request.name === 'credentialsWorkspaceDelete'),
    ).toBe(false);
    unmount();
    client.stop();
  });
});
