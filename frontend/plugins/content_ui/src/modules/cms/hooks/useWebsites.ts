import { useQuery } from '@apollo/client';
import { GET_CLIENT_PORTALS } from '../graphql/queries';

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
  const { data, loading, refetch } = useQuery(GET_CLIENT_PORTALS, {
    variables: {
      filter: {},
    },
    errorPolicy: 'all',
  });

  const websites = data?.getClientPortals?.list || [];

  return {
    websites,
    loading,
    refetch,
    totalCount: websites.length,
  };
}
