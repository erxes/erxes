import {
  ApolloClient,
  InMemoryCache,
  NormalizedCacheObject,
  useApolloClient,
} from '@apollo/client';
import { useMemo } from 'react';

// The host enables Apollo devtools, whose mutation history retains variables.
// Reuse authentication/transport, but never its cache or mutation history.
export function useCredentialMutationClient(): ApolloClient<NormalizedCacheObject> {
  const host = useApolloClient();
  return useMemo(
    () =>
      new ApolloClient({
        link: host.link,
        cache: new InMemoryCache(),
        connectToDevTools: false,
        defaultOptions: {
          mutate: {
            fetchPolicy: 'no-cache',
            context: { fetchOptions: { cache: 'no-store' } },
          },
        },
      }),
    [host],
  );
}
