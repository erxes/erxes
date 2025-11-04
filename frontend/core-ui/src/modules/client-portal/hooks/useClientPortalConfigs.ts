import { useQuery } from '@apollo/client';
import { CLIENT_PORTAL_GET_CONFIGS } from '@/client-portal/graphql/queries';

interface IClientPortalConfig {
  _id: string;
  name: string;
  url?: string;
  kind?: string;
  description?: string;
}

export function useClientPortalConfigs(variables?: {
  kind?: string;
  search?: string;
  limit?: number;
  cursor?: string | null;
}) {
  const { data, loading, error } = useQuery<{
    clientPortalGetConfigs: {
      list: IClientPortalConfig[];
      totalCount: number;
      pageInfo?: any;
    };
  }>(CLIENT_PORTAL_GET_CONFIGS, {
    variables,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  return {
    loading,
    error,
    configs: data?.clientPortalGetConfigs?.list ?? [],
    totalCount: data?.clientPortalGetConfigs?.totalCount ?? 0,
    pageInfo: data?.clientPortalGetConfigs?.pageInfo,
  };
}
