import { ApolloCache, MutationHookOptions, useMutation } from '@apollo/client';
import { ADD_APP, GET_APPS } from '../graphql';
import { IApp, IAppData } from '../types';
import { useAppsVariables } from './useApps';

export function useAppsAdd(options?: MutationHookOptions<{ appsAdd: IApp }, any>) {
  const variables = useAppsVariables(options);
  const [appsAdd, { loading, error }] = useMutation(ADD_APP, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      if (!data?.appsAdd) return;

      cache.updateQuery<IAppData>(
        { query: GET_APPS, variables },
        (existingData) => {
          if (!existingData) return existingData;

          return {
            apps: [data.appsAdd, ...existingData.apps],
            appsTotalCount: existingData.appsTotalCount + 1,
          };
        },
      );
    },
  });

  return {
    appsAdd,
    loading,
    error,
  };
}
