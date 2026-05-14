import { useQuery } from '@apollo/client';
import { CMS_CATEGORIES } from '../graphql/queries';

export interface CmsCategory {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  status: string;
  clientPortalId: string;
  createdAt: string;
  updatedAt: string;
  parent?: CmsCategory;
  parentId?: string;
}

export interface UseCategoriesProps {
  clientPortalId?: string;
  searchValue?: string;
  status?: string;
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  sortField?: string;
  sortDirection?: string;
}

interface UseCategoriesResult {
  categories: CmsCategory[];
  loading: boolean;
  error?: any;
  refetch: () => void;
}

export function useCategories({
  clientPortalId,
  searchValue,
  status,
  limit = 50,
  cursor,
  direction,
  sortField,
  sortDirection,
}: UseCategoriesProps): UseCategoriesResult {
  const { data, loading, error, refetch } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId,
      searchValue,
      status,
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

  const categories = data?.cmsCategories?.list || [];

  return {
    categories,
    loading,
    error,
    refetch,
  };
}
