import { OperationVariables, useQuery } from '@apollo/client';
import { GET_INTEGRATIONS_COUNT_BY_KIND } from '../graphql/queries/getIntegrations';

export const useIntegrationsCounts = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery(GET_INTEGRATIONS_COUNT_BY_KIND, {
    ...options,
  });
  const { integrationsTotalCount } = data || {};
  return {
    totalCount: integrationsTotalCount?.total,
    loading,
    error,
  };
};
