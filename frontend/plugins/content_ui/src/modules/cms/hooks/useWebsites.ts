import { useQuery } from '@apollo/client';
import { CLIENT_PORTAL_GET_CONFIGS } from '../graphql/queries';

export interface Website {
  _id: string;
  name: string;
  description: string;
  domain: string;
  createdAt: string;
  kind: string;
  url: string;
  __typename: string;
}

interface UseWebsitesResult {
  websites: Website[];
  loading: boolean;
  refetch: () => void;
  totalCount: number;
}

interface UseWebsitesProps {
  searchValue?: string;
}

export function useWebsites({
  searchValue,
}: UseWebsitesProps = {}): UseWebsitesResult {
  const { data, loading, refetch } = useQuery(CLIENT_PORTAL_GET_CONFIGS, {
    variables: {
      searchValue: searchValue || '',
    },
    errorPolicy: 'all',
  });

  const websites = data?.clientPortalGetConfigs || [];

  return {
    websites,
    loading,
    refetch,
    totalCount: websites.length,
  };
}
