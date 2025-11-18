import { useQuery } from '@apollo/client';
import { CMS_TAGS } from '../graphql/queries';

export interface CmsTag {
  _id: string;
  clientPortalId: string;
  name: string;
  slug: string;
  colorCode: string;
  createdAt: string;
  updatedAt: string;
  __typename: string;
}

interface UseTagsProps {
  clientPortalId: string;
  searchValue?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  sortField?: string;
  sortDirection?: string;
}

interface UseTagsResult {
  tags: CmsTag[];
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useTags({
  clientPortalId,
  searchValue,
  limit = 20,
  cursor,
  direction,
  sortField,
  sortDirection,
}: UseTagsProps): UseTagsResult {
  const { data, loading, error, refetch } = useQuery(CMS_TAGS, {
    variables: {
      clientPortalId,
      searchValue,
      limit,
      cursor,
      direction,
      sortField,
      sortDirection,
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const tags = data?.cmsTags?.tags || [];

  return {
    tags,
    loading,
    error,
    refetch,
  };
}
