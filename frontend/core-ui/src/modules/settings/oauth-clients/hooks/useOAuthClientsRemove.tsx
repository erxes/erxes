import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import { REMOVE_OAUTH_CLIENT, GET_OAUTH_CLIENTS } from '../graphql';
import { IOAuthClientAppData } from '../types';
import { useOAuthClientsVariables } from './useOAuthClients';

export function useOAuthClientsRemove(options?: MutationHookOptions<any, any>) {
  const variables = useOAuthClientsVariables(options);
  const [oauthClientAppsRemove, { loading, error }] = useMutation(
    REMOVE_OAUTH_CLIENT,
    {
      ...options,
      update: (cache: ApolloCache<any>, _result, { variables: mutVars }) => {
        const id = mutVars?._id;

        if (!id) return;

        cache.updateQuery<IOAuthClientAppData>(
          { query: GET_OAUTH_CLIENTS, variables },
          (existingData) => {
            if (!existingData) return existingData;

            return {
              oauthClientApps: existingData.oauthClientApps.filter(
                (oauthClientApp) => oauthClientApp._id !== id,
              ),
              oauthClientAppsTotalCount:
                existingData.oauthClientAppsTotalCount - 1,
            };
          },
        );
      },
    },
  );

  return {
    oauthClientAppsRemove,
    loading,
    error,
  };
}
