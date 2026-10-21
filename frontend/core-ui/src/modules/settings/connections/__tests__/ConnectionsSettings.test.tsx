import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ConnectionsSettings } from '../components/ConnectionsSettings';
import { usePermissionCheck } from './workspace-ui';
import { savedConnection, templates } from './fixtures';
import type { CredentialMetadata } from '../types';

const renderSettings = ({
  permissions = [
    'credentialsRead',
    'credentialsManage',
    'credentialGrantsManage',
  ],
  initial = [savedConnection],
  fail = false,
}: {
  permissions?: string[];
  initial?: CredentialMetadata[];
  fail?: boolean;
} = {}) => {
  usePermissionCheck.mockImplementation(() => ({
    isLoaded: true,
    hasActionPermission: (action) => permissions.includes(action),
  }));
  let records = [...initial];
  const operations: string[] = [];
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          operations.push(operation.operationName);
          if (fail) {
            observer.error(new Error('synthetic-private-upstream-error'));
            return;
          }
          const metadata = (record: CredentialMetadata) => ({
            ...record,
            __typename: 'CredentialMetadata',
            fields: record.fields.map((field) => ({
              ...field,
              help: field.help ?? null,
            })),
          });
          let data: Record<string, unknown>;
          switch (operation.operationName) {
            case 'credentialsWorkspaceList':
              data = {
                credentialsList: records.map(metadata),
                credentialsTemplates: templates.map((template) => ({
                  ...template,
                  description: template.description ?? null,
                  fields: template.fields.map((field) => ({
                    ...field,
                    help: field.help ?? null,
                  })),
                })),
              };
              break;
            case 'credentialsWorkspaceDetail':
              data = {
                credentialsDetail: records.find(
                  (record) => record._id === operation.variables._id,
                )
                  ? metadata(
                      records.find(
                        (record) => record._id === operation.variables._id,
                      ) || savedConnection,
                    )
                  : null,
              };
              break;
            case 'credentialsWorkspaceCreate': {
              const created = {
                ...savedConnection,
                _id: 'new-connection',
                name: operation.variables.input.name,
              };
              records.push(created);
              data = { credentialsCreate: metadata(created) };
              break;
            }
            case 'credentialsWorkspaceDelete':
              records = records.filter(
                (record) => record._id !== operation.variables._id,
              );
              data = { credentialsDelete: true };
              break;
            default:
              data = { credentialsGrants: [] };
          }
          observer.next({ data });
          observer.complete();
        }),
    ),
  });
  return {
    ...render(
      <ApolloProvider client={client}>
        <ConnectionsSettings />
      </ApolloProvider>,
    ),
    client,
    operations,
  };
};

describe('Connections workspace', () => {
  it('denies the page before issuing metadata queries without read permission', () => {
    const { client, operations, unmount } = renderSettings({ permissions: [] });
    expect(screen.getByRole('alert').textContent).toContain(
      'You do not have permission',
    );
    expect(operations).toEqual([]);
    unmount();
    client.stop();
  });

  it('shows metadata but no configuration actions to read-only users', async () => {
    const { client, unmount } = renderSettings({
      permissions: ['credentialsRead'],
    });
    const row = await screen.findByRole('button', {
      name: /Production OpenAI/,
    });
    expect(screen.queryByRole('button', { name: 'New connection' })).toBeNull();
    fireEvent.click(row);
    await screen.findByText('Configured · not verified');
    expect(screen.queryByRole('button', { name: 'Edit details' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Remove connection' }),
    ).toBeNull();
    unmount();
    client.stop();
  });

  it('redacts list failures and provides a retry action', async () => {
    const { client, operations, unmount } = renderSettings({ fail: true });
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(document.body.textContent).not.toContain(
      'synthetic-private-upstream-error',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() =>
      expect(
        operations.filter((name) => name === 'credentialsWorkspaceList'),
      ).toHaveLength(2),
    );
    unmount();
    client.stop();
  });

  it('refreshes the connection list immediately after guided creation', async () => {
    const { client, unmount } = renderSettings({ initial: [] });
    fireEvent.click(
      await screen.findByRole('button', { name: /Use your OpenAI account/ }),
    );
    fireEvent.change(screen.getByLabelText('Connection name'), {
      target: { value: 'New OpenAI connection' },
    });
    fireEvent.change(screen.getByLabelText('API key'), {
      target: { value: 'synthetic-only-key' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Review connection' }));
    await screen.findByRole('heading', { name: 'Review your connection' });
    fireEvent.click(screen.getByRole('button', { name: 'Save connection' }));
    await screen.findByRole('heading', {
      name: 'Your connection is configured',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(
      await screen.findByRole('button', { name: /New OpenAI connection/ }),
    ).toBeTruthy();
    expect(screen.queryByText('Start with your first connection')).toBeNull();
    unmount();
    client.stop();
  });

  it('requires removal confirmation and updates the list without a page reload', async () => {
    const { client, operations, unmount } = renderSettings();
    fireEvent.click(
      await screen.findByRole('button', { name: /Production OpenAI/ }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Remove connection' }),
    );
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(operations).not.toContain('credentialsWorkspaceDelete');
    fireEvent.click(screen.getByRole('button', { name: 'Remove connection' }));
    await screen.findByText('Start with your first connection');
    expect(operations).toContain('credentialsWorkspaceDelete');
    expect(
      screen.queryByRole('button', { name: /Production OpenAI/ }),
    ).toBeNull();
    unmount();
    client.stop();
  });
});
