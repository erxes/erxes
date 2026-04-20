import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_OAUTH_CLIENT, GET_OAUTH_CLIENTS } from '../graphql';
import { IOAuthClientApp, IOAuthClientAppData } from '../types';
import { useOAuthClientsVariables } from './useOAuthClients';

export function useOAuthClientsAdd(
  options?: MutationHookOptions<{ oauthClientAppsAdd: IOAuthClientApp }, any>,
) {
  const variables = useOAuthClientsVariables(options);
  const [oauthClientAppsAdd, { loading, error }] = useMutation(
    ADD_OAUTH_CLIENT,
    {
      ...options,
      update: (cache: ApolloCache<any>, { data }) => {
        if (!data?.oauthClientAppsAdd) return;

        cache.updateQuery<IOAuthClientAppData>(
          { query: GET_OAUTH_CLIENTS, variables },
          (existingData) => {
            if (!existingData) return existingData;

            return {
              oauthClientApps: [
                data.oauthClientAppsAdd,
                ...existingData.oauthClientApps,
              ],
              oauthClientAppsTotalCount:
                existingData.oauthClientAppsTotalCount + 1,
            };
          },
        );
      },
    },
  );

  return {
    oauthClientAppsAdd,
    loading,
    error,
  };
}
