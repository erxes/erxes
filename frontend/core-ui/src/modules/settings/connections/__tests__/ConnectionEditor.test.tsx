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
import { ConnectionEditor } from '../components/ConnectionEditor';
import { savedConnection, templates } from './fixtures';

const renderEditor = (
  options: { edit?: boolean; failFirst?: boolean } = {},
) => {
  const requests: Record<string, unknown>[] = [];
  let attempts = 0;
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    connectToDevTools: true,
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          requests.push(operation.variables);
          attempts += 1;
          if (options.failFirst && attempts === 1) {
            observer.error(new Error('synthetic-secret-in-upstream-error'));
            return;
          }
          const key =
            operation.operationName === 'credentialsWorkspaceUpdate'
              ? 'credentialsUpdate'
              : 'credentialsCreate';
          observer.next({
            data: {
              [key]: { ...savedConnection, __typename: 'CredentialMetadata' },
            },
          });
          observer.complete();
        }),
    ),
  });
  const onSaved = jest.fn();
  const onClose = jest.fn();
  const onView = jest.fn();
  const view = render(
    <ApolloProvider client={client}>
      <ConnectionEditor
        templates={templates}
        connection={options.edit ? savedConnection : undefined}
        onSaved={onSaved}
        onClose={onClose}
        onView={onView}
      />
    </ApolloProvider>,
  );
  return { ...view, client, requests, onSaved, onClose, onView };
};

const chooseOpenAI = () =>
  fireEvent.click(screen.getByRole('button', { name: /OpenAI/ }));
const enterKey = () =>
  fireEvent.change(screen.getByLabelText('API key'), {
    target: { value: 'synthetic-only-api-key' },
  });
const review = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Review connection' }));
  await screen.findByRole('heading', { name: 'Review your connection' });
};

describe('guided connection setup', () => {
  it('validates required details before review and does not submit during configuration', async () => {
    const { requests, client, unmount } = renderEditor();
    chooseOpenAI();
    fireEvent.click(screen.getByRole('button', { name: 'Review connection' }));
    expect(await screen.findByText('Enter a value')).toBeTruthy();
    expect(requests).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'Set up OpenAI' })).toBeTruthy();
    unmount();
    client.stop();
  });

  it('preserves values on Back, redacts review, and resets values when the provider changes', async () => {
    const { client, unmount } = renderEditor();
    chooseOpenAI();
    enterKey();
    await review();
    expect(document.body.textContent).not.toContain('synthetic-only-api-key');
    expect(document.querySelector('input[type="password"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect((screen.getByLabelText('API key') as HTMLInputElement).value).toBe(
      'synthetic-only-api-key',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: /SMTP/ }));
    expect((screen.getByLabelText('Port') as HTMLInputElement).value).toBe(
      '587',
    );
    expect((screen.getByLabelText('Password') as HTMLInputElement).value).toBe(
      '',
    );
    expect(screen.queryByLabelText('API key')).toBeNull();
    unmount();
    client.stop();
  });

  it('saves through the isolated client, clears input, and offers an honest saved-state next step', async () => {
    const { requests, onSaved, onView, onClose, client, unmount } =
      renderEditor();
    chooseOpenAI();
    enterKey();
    await review();
    fireEvent.click(screen.getByRole('button', { name: 'Save connection' }));
    await screen.findByRole('heading', {
      name: 'Your connection is configured',
    });
    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(requests[0]).toMatchObject({
      input: {
        templateId: 'openai',
        category: 'ai',
        fields: expect.arrayContaining([
          {
            key: 'apiKey',
            label: 'API key',
            type: 'password',
            secret: true,
            action: 'replace',
            value: 'synthetic-only-api-key',
          },
        ]),
      },
    });
    expect(
      screen.getByText(/Provider access has not been tested/),
    ).toBeTruthy();
    expect(document.body.innerHTML).not.toContain('synthetic-only-api-key');
    expect(client.cache.extract()).toEqual({});
    const manager: unknown = Reflect.get(client, 'queryManager');
    expect(
      manager && typeof manager === 'object'
        ? Reflect.get(manager, 'mutationStore')
        : null,
    ).toEqual({});
    fireEvent.click(screen.getByRole('button', { name: 'View connection' }));
    expect(onView).toHaveBeenCalledWith(savedConnection._id);
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();
    client.stop();
  });

  it('keeps a failed submission retryable without displaying raw upstream errors', async () => {
    const { requests, client, unmount } = renderEditor({ failFirst: true });
    chooseOpenAI();
    enterKey();
    await review();
    fireEvent.click(screen.getByRole('button', { name: 'Save connection' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(document.body.textContent).not.toContain(
      'synthetic-secret-in-upstream-error',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save connection' }));
    await screen.findByRole('heading', {
      name: 'Your connection is configured',
    });
    expect(requests).toHaveLength(2);
    expect(requests[1]).toEqual(requests[0]);
    unmount();
    client.stop();
  });

  it('keeps saved fields empty and retains them explicitly when editing', async () => {
    const { requests, client, unmount } = renderEditor({ edit: true });
    expect((screen.getByLabelText('API key') as HTMLInputElement).value).toBe(
      '',
    );
    await review();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByRole('heading', { name: 'Connection updated' });
    expect(requests[0]).toMatchObject({
      _id: savedConnection._id,
      input: {
        fields: expect.arrayContaining([
          {
            key: 'apiKey',
            label: 'API key',
            type: 'password',
            secret: true,
            action: 'keep',
          },
        ]),
      },
    });
    unmount();
    client.stop();
  });

  it('clears entered values when dismissed without saving', async () => {
    const { client, onClose, requests, unmount } = renderEditor();
    chooseOpenAI();
    enterKey();
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'Close connection setup' }),
      );
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(requests).toHaveLength(0);
    await waitFor(() =>
      expect(document.body.innerHTML).not.toContain('synthetic-only-api-key'),
    );
    unmount();
    client.stop();
  });

  it('clears optional saved fields only through an explicit action and supports undo', async () => {
    const { client, requests, unmount } = renderEditor({ edit: true });
    fireEvent.click(screen.getByRole('button', { name: 'Optional settings' }));
    expect(
      (
        screen.getByRole('textbox', {
          name: /API base URL/,
        }) as HTMLInputElement
      ).value,
    ).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'Clear API base URL' }));
    expect(screen.getByText('This saved value will be removed.')).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', { name: 'Undo change to API base URL' }),
    );
    expect(screen.queryByText('This saved value will be removed.')).toBeNull();
    await review();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await screen.findByRole('heading', { name: 'Connection updated' });
    expect(requests[0]).toMatchObject({
      input: {
        fields: expect.arrayContaining([
          {
            key: 'baseUrl',
            label: 'API base URL',
            type: 'url',
            secret: false,
            action: 'keep',
          },
        ]),
      },
    });
    unmount();
    client.stop();
  });
});
