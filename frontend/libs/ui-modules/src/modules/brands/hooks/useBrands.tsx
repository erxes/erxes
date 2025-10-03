import { useQuery, QueryHookOptions, OperationVariables } from '@apollo/client';

import { BRANDS_QUERY, GET_BRAND_BY_ID } from '../graphql/queries/BrandsQuery';

import { IBrand } from '../types/brand';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';

const BRANDS_PER_PAGE = 20;

export const useBrands = (
  options?: QueryHookOptions<ICursorListResponse<IBrand>>,
) => {
  const { data, loading, fetchMore, error } = useQuery<
    ICursorListResponse<IBrand>
  >(BRANDS_QUERY, {
    ...options,
    variables: {
      limit: BRANDS_PER_PAGE,
      ...options?.variables,
    },
  });

  const { list: brands, totalCount, pageInfo } = data?.brands ?? {};

  const handleFetchMore = () => {
    if (totalCount && totalCount <= (brands?.length || 0)) return;
    if (!fetchMore) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: BRANDS_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          brands: {
            list: [
              ...(prev.brands?.list || []),
              ...fetchMoreResult.brands.list,
            ],
            totalCount: fetchMoreResult.brands.totalCount,
            pageInfo: fetchMoreResult.brands.pageInfo,
          },
        });
      },
    });
  };

  return {
    brands,
    loading,
    error,
    handleFetchMore,
    totalCount,
  };
};

export const useBrandsByIds = (options: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    brandDetail: IBrand;
  }>(GET_BRAND_BY_ID, {
    ...options,
  });

  const { brandDetail } = data || {};

  return {
    brandDetail,
    loading,
    error,
  };
};
