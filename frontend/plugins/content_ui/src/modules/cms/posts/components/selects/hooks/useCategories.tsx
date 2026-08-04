import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { ICategory } from '../types/category';
import { POST_CMS_CATEGORIES } from '../../../graphql/queries/postCmsCategoriesQuery';

const CATEGORIES_PER_PAGE = 20;

export const useCategories = (
  options?: QueryHookOptions<ICursorListResponse<ICategory>> & {
    clientPortalId?: string;
  },
) => {
  const { clientPortalId, ...queryOptions } = options || {};

  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<ICategory>
  >(POST_CMS_CATEGORIES, {
    ...queryOptions,
    variables: {
      clientPortalId: clientPortalId || '',
      ...queryOptions?.variables,
    },
    skip: !clientPortalId || queryOptions?.skip,
  });

  const {
    list: categories,
    totalCount = 0,
    pageInfo,
  } = data?.cmsCategories ?? {};

  const handleFetchMore = () => {
    if (totalCount <= (categories?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: CATEGORIES_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          cmsCategories: {
            list: [
              ...(prev.cmsCategories?.list || []),
              ...fetchMoreResult.cmsCategories.list,
            ],
            totalCount: fetchMoreResult.cmsCategories.totalCount,
            pageInfo: fetchMoreResult.cmsCategories.pageInfo,
          },
        });
      },
    });
  };

  const categoriesWithHasChildren = categories?.map((category) => ({
    ...category,
    hasChildren: categories?.some((p) => p.parentId === category._id),
  }));

  return {
    categories: categoriesWithHasChildren,
    sortedCategories: [...(categoriesWithHasChildren || [])].sort((a, b) =>
      a.order?.localeCompare(b.order),
    ),
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
