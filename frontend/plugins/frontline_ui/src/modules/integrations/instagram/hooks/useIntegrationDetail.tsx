import { useQuery } from '@apollo/client';
import { GET_INTEGRATION_DETAIL } from '@/integrations/graphql/queries/getIntegrationDetail';
import { IIntegrationDetail } from '@/integrations/types/Integration';

interface IIGIntegrationDetail extends IIntegrationDetail {
  instagramPage: { _id: string; name: string; pageId: string }[];
}

export const useIntegrationDetail = ({
  integrationId,
}: {
  integrationId: string | null;
}) => {
  const { data, loading } = useQuery<{
    integrationDetail: IIGIntegrationDetail;
  }>(GET_INTEGRATION_DETAIL, {
    variables: {
      id: integrationId,
    },
    skip: !integrationId,
  });

  return {
    integrationDetail: data?.integrationDetail,
    loading,
  };
};
