import { OperationVariables, useQuery } from '@apollo/client';
import { GET_OAUTH_CLIENTS } from '../graphql';

const OAUTH_CLIENTS_PER_PAGE = 30;

export const useOAuthClientsVariables = (options?: OperationVariables) => {
  return {
    ...options?.variables,
    perPage: OAUTH_CLIENTS_PER_PAGE,
  };
};

export const useOAuthClients = (options?: OperationVariables) => {
  const variables = useOAuthClientsVariables(options);
  const { data, error, loading } = useQuery(GET_OAUTH_CLIENTS, {
    variables,
    ...options,
  });

  return {
    oauthClientApps: data?.oauthClientApps || [],
    totalCount: data?.oauthClientAppsTotalCount || 0,
    error,
    loading,
  };
};
