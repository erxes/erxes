import { OperationVariables, useQuery } from '@apollo/client';
import { GET_INTEGRATIONS_BY_KIND } from '../graphql/queries/getIntegrations';

export const useIntegrations = (options?: OperationVariables) => {
  const { data, error, loading } = useQuery(GET_INTEGRATIONS_BY_KIND, {
    ...options,
  });

  const integrations = data ? data?.integrations?.list : [];

  return {
    integrations,
    totalCount: data ? data.integrations?.totalCount : 0,
    loading,
    error,
  };
};
