import { OperationVariables, useQuery } from '@apollo/client';
import { GET_APPS } from '../graphql';

const APPS_PER_PAGE = 30;

export const useAppsVariables = (options?: OperationVariables) => {
  return {
    ...options?.variables,
    perPage: APPS_PER_PAGE,
  };
};

export const useApps = (options?: OperationVariables) => {
  const variables = useAppsVariables(options);
  const { data, error, loading } = useQuery(GET_APPS, {
    variables,
    ...options,
  });
  const apps = data?.apps || [];
  const totalCount = data?.appsTotalCount || 0;

  return {
    apps,
    totalCount,
    error,
    loading,
  };
};
