import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { ICategory } from '../types/category';
import { POST_CMS_CATEGORIES } from '../../../graphql/queries/postCmsCategoriesQuery';

const CATEGORIES_PER_PAGE = 20;

export const useCategories = (
  options?: QueryHookOptions<ICursorListResponse<ICategory>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<ICategory>
  >(POST_CMS_CATEGORIES, { ...options });

  const {
    list: categories,
    totalCount = 0,
    pageInfo,
  } = data?.categoriesMain ?? {};

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
          categoriesMain: {
            list: [
              ...(prev.categoriesMain?.list || []),
              ...fetchMoreResult.categoriesMain.list,
            ],
            totalCount: fetchMoreResult.categoriesMain.totalCount,
            pageInfo: fetchMoreResult.categoriesMain.pageInfo,
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
