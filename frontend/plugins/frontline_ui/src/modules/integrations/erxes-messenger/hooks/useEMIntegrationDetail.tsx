import { EM_INTEGRATION_DETAIL_QUERY } from '@/integrations/erxes-messenger/graphql/queries/integrationDetailQuery';
import { useQuery } from '@apollo/client';

export const useEMIntegrationDetail = ({ id }: { id: string | false }) => {
  const { data, loading } = useQuery(EM_INTEGRATION_DETAIL_QUERY, {
    variables: id ? { _id: id } : undefined,
    skip: !id,
  });

  const integrationDetail = data?.integrationDetail ?? undefined;

  return { integrationDetail, loading };
};
