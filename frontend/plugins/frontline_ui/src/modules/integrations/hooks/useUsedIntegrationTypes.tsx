import { useQuery } from '@apollo/client';
import { GET_INTEGRATION_KINDS } from '../graphql/queries/getIntegrations';
import { IIntegrationType } from '../types/Integration';

export const useUsedIntegrationTypes = () => {
  const { data, loading } = useQuery<{
    integrationsGetUsedTypes: IIntegrationType[];
  }>(GET_INTEGRATION_KINDS);

  return {
    integrationTypes: data?.integrationsGetUsedTypes || [],
    loading,
  };
};
