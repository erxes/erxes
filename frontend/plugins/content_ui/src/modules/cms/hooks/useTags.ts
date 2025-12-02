import { useQuery } from '@apollo/client';
import { CMS_TAGS } from '../graphql/queries';

export interface CmsTag {
  _id: string;
  name: string;
  colorCode: string;
  createdAt: string;
}

interface UseTagsProps {
  type?: string;
  searchValue?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
}

interface UseTagsResult {
  tags: CmsTag[];
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useTags({
  type,
  searchValue,
  limit = 20,
  cursor,
  direction,
}: UseTagsProps): UseTagsResult {
  const { data, loading, error, refetch } = useQuery(CMS_TAGS, {
    variables: {
      type,
      searchValue,
      limit,
      cursor,
      direction,
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const tags = data?.tags?.list || [];

  return {
    tags,
    loading,
    error,
    refetch,
  };
}
