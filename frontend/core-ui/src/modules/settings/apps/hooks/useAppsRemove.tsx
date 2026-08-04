import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import { REMOVE_APP, GET_APPS } from '../graphql';
import { IAppData } from '../types';
import { useAppsVariables } from './useApps';

export function useAppsRemove(options?: MutationHookOptions<any, any>) {
  const variables = useAppsVariables(options);
  const [appsRemove, { loading, error }] = useMutation(REMOVE_APP, {
    ...options,
    update: (cache: ApolloCache<any>, _result, { variables: mutVars }) => {
      const id = mutVars?._id;
      if (!id) return;

      cache.updateQuery<IAppData>(
        { query: GET_APPS, variables },
        (existingData) => {
          if (!existingData) return existingData;

          return {
            apps: existingData.apps.filter((app) => app._id !== id),
            appsTotalCount: existingData.appsTotalCount - 1,
          };
        },
      );
    },
  });

  return {
    appsRemove,
    loading,
    error,
  };
}
