import { useQuery } from '@apollo/client';
import { GET_INTEGRATION_DETAIL } from '@/integrations/graphql/queries/getIntegrationDetail';

export const useIntegrationDetail = ({
  integrationId,
}: {
  integrationId: string | null;
}) => {
  const { data, loading } = useQuery(GET_INTEGRATION_DETAIL, {
    variables: integrationId ? { id: integrationId } : undefined,
    skip: !integrationId,
  });

  return {
    integrationDetail: data?.integrationDetail,
    loading,
  };
};
