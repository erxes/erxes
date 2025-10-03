import { EM_INTEGRATION_DETAIL_QUERY } from '@/integrations/erxes-messenger/graphql/queries/integrationDetailQuery';
import { useQuery } from '@apollo/client';

export const useEMIntegrationDetail = ({ id }: { id: string | false }) => {
  const { data, loading } = useQuery(EM_INTEGRATION_DETAIL_QUERY, {
    variables: {
      _id: id,
    },
    skip: !id,
  });

  const { integrationDetail } = data || {};

  return { integrationDetail, loading };
};
