import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { renderHook } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { CREDENTIALS_CREATE, CREDENTIALS_GRANT_CREATE } from '../graphql';
import { useCredentialMutationClient } from '../useCredentialMutationClient';

const mutationHistory = (client: object): unknown => {
  const manager: unknown = Reflect.get(client, 'queryManager');
  return manager && typeof manager === 'object' && 'mutationStore' in manager
    ? manager.mutationStore
    : undefined;
};

describe('connection mutation transport privacy', () => {
  it('shares authentication without registering secrets in the host cache or mutation history', async () => {
    let cachePolicy: unknown;
    const host = new ApolloClient({
      cache: new InMemoryCache(),
      connectToDevTools: true,
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            cachePolicy = operation.getContext().fetchOptions?.cache;
            observer.next({
              data: {
                credentialsGrantCreate: {
                  token: 'test-only-one-time-token',
                  grant: {
                    _id: 'grant',
                    credentialId: 'credential',
                    pluginName: 'worker',
                    name: 'Test',
                    createdAt: '2026-10-20',
                    revokedAt: null,
                  },
                },
              },
            });
            observer.complete();
          }),
      ),
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={host}>{children}</ApolloProvider>
    );
    const { result, unmount } = renderHook(useCredentialMutationClient, {
      wrapper,
    });
    const sensitive = result.current;
    try {
      const response = await sensitive.mutate<{
        credentialsGrantCreate: { token: string };
      }>({
        mutation: CREDENTIALS_GRANT_CREATE,
        variables: {
          credentialId: 'credential',
          pluginName: 'worker',
          name: 'Test',
        },
      });
      expect(response.data?.credentialsGrantCreate.token).toBe(
        'test-only-one-time-token',
      );
      expect(sensitive).not.toBe(host);
      expect(sensitive.link).toBe(host.link);
      expect(cachePolicy).toBe('no-store');
      expect(sensitive.cache.extract()).toEqual({});
      expect(host.cache.extract()).toEqual({});
      expect(mutationHistory(host)).toEqual({});
      expect(mutationHistory(sensitive)).toBeUndefined();
    } finally {
      unmount();
      sensitive.stop();
      host.stop();
    }
  });

  it('does not retain failed plaintext input in either client', async () => {
    const host = new ApolloClient({
      cache: new InMemoryCache(),
      connectToDevTools: true,
      link: new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.error(new Error('Test transport failure'));
          }),
      ),
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <ApolloProvider client={host}>{children}</ApolloProvider>
    );
    const { result, unmount } = renderHook(useCredentialMutationClient, {
      wrapper,
    });
    const sensitive = result.current;
    try {
      await expect(
        sensitive.mutate({
          mutation: CREDENTIALS_CREATE,
          variables: {
            input: {
              name: 'Test',
              description: '',
              templateId: 'generic',
              category: 'custom',
              fields: [
                {
                  key: 'token',
                  action: 'replace',
                  value: 'test-only-plaintext',
                },
              ],
            },
          },
        }),
      ).rejects.toThrow('Test transport failure');
      expect(sensitive.cache.extract()).toEqual({});
      expect(host.cache.extract()).toEqual({});
      expect(mutationHistory(host)).toEqual({});
      expect(mutationHistory(sensitive)).toBeUndefined();
    } finally {
      unmount();
      sensitive.stop();
      host.stop();
    }
  });
});
