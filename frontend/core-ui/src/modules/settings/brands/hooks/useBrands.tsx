import { OperationVariables, useQuery } from '@apollo/client';
import { GET_BRANDS } from '../graphql';
import { useMultiQueryState } from 'erxes-ui';


export const useBrandsVariables = (options?: OperationVariables) => {
  const BRANDS_LIMIT = 30;
  const [queries] = useMultiQueryState<{
    searchValue: string;
  }>(['searchValue']);
  return {
    ...options?.variables,
    searchValue: queries?.searchValue,
    limit: BRANDS_LIMIT,
    orderBy: {
      createdAt: -1,
    },
  };
};

export const useBrands = (options?: OperationVariables) => {
  const variables = useBrandsVariables(options);
  const { data, error, loading } = useQuery(GET_BRANDS, {
    variables,
    ...options,
  });
  const brands = data?.brands?.list || [];
  const totalCount = data?.brands?.totalCount || 0;
  const pageInfo = data?.brands?.pageInfo || undefined;

  return {
    brands,
    totalCount,
    pageInfo,
    error,
    loading,
  };
};
