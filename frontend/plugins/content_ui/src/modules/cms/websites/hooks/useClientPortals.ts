import { useQuery } from '@apollo/client';
import { GET_CLIENT_PORTALS } from '@/cms/websites/graphql';

type ClientPortalFilter = Record<string, unknown>;

interface ClientPortal {
  _id: string;
  name: string;
  domain: string;
  token: string;
  createdAt: string;
  updatedAt: string;
  __typename: string;
}

interface ClientPortalsResponse {
  getClientPortals: {
    list: ClientPortal[];
    totalCount: number;
    pageInfo: {
      hasNextPage: boolean;
      __typename: string;
    };
    __typename: string;
  };
}

export const useClientPortals = (
  filter: ClientPortalFilter = {},
  skip = false,
) => {
  const { data, loading, error, refetch } = useQuery<ClientPortalsResponse>(
    GET_CLIENT_PORTALS,
    {
      variables: { filter },
      skip,
    },
  );

  return {
    clientPortals: data?.getClientPortals?.list || [],
    totalCount: data?.getClientPortals?.totalCount || 0,
    pageInfo: data?.getClientPortals?.pageInfo,
    loading,
    error,
    refetch,
  };
};
