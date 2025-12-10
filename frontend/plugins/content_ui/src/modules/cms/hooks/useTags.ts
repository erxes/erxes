import { useQuery } from '@apollo/client';
import { CMS_TAGS } from '../graphql/queries';

export interface CmsTag {
  _id: string;
  name: string;
  colorCode: string;
  createdAt: string;
}

export interface UseTagsProps {
  clientPortalId?: string;
  type?: string;
  searchValue?: string;
  limit?: number;
  cursor?: string;
  cursorMode?: string;
  direction?: 'forward' | 'backward';
  sortField?: string;
  sortMode?: string;
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
  type,
  searchValue,
  limit = 20,
  cursor,
  cursorMode,
  direction,
  sortField,
  sortMode,
  sortDirection,
}: UseTagsProps): UseTagsResult {
  const { data, loading, error, refetch } = useQuery(CMS_TAGS, {
    variables: {
      clientPortalId,
      type,
      searchValue,
      limit,
      cursor,
      cursorMode,
      direction,
      sortField,
      sortMode,
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
