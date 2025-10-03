import { useQuery } from '@apollo/client';
import { GET_INTEGRATION_DETAIL } from '@/integrations/graphql/queries/getIntegrationDetail';
import { IIntegrationDetail } from '@/integrations/types/Integration';

export const useIntegrationDetail = ({
  integrationId,
}: {
  integrationId: string | null;
}) => {
  const { data, loading } = useQuery<{ integrationDetail: IIntegrationDetail }>(
    GET_INTEGRATION_DETAIL,
    {
      variables: {
        id: integrationId,
      },
      skip: !integrationId,
    },
  );

  return {
    integrationDetail: data?.integrationDetail,
    loading,
  };
};
