import { OperationVariables, useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { ACC_TRS__PER_PAGE } from '../../../transactions/types/constants';
import { RESERVE_REMS_QUERY } from '../graphql/reserveRemQueries';
import { IReserveRem } from '../types/ReserveRem';

type ReserveRemQueryParams = {
  searchValue: string;
  branchId: string;
  departmentId: string;
  productId: string;
  categoryId: string;
};

const RESERVE_REM_FILTER_KEYS: (keyof ReserveRemQueryParams)[] = [
  'searchValue',
  'branchId',
  'departmentId',
  'productId',
  'categoryId',
];

export const useReserveRemQueryParams = () => {
  const [queryParams] =
    useMultiQueryState<ReserveRemQueryParams>(RESERVE_REM_FILTER_KEYS);
  return queryParams;
};

export const useReserveRemVariables = () => {
  const queryParams = useReserveRemQueryParams() || {};
  const variables: Record<string, any> = {};

  if (queryParams.searchValue) variables.searchValue = queryParams.searchValue;
  if (queryParams.branchId) variables.branchId = queryParams.branchId;
  if (queryParams.departmentId)
    variables.departmentId = queryParams.departmentId;
  if (queryParams.productId) variables.productId = queryParams.productId;
  if (queryParams.categoryId)
    variables.productCategoryId = queryParams.categoryId;

  return variables;
};

export const useReserveRems = (options?: OperationVariables) => {
  const filterVariables = useReserveRemVariables();

  const { data, loading, error, fetchMore } = useQuery<{
    reserveRems: IReserveRem[];
    reserveRemsCount: number;
  }>(RESERVE_REMS_QUERY, {
    ...options,
    variables: {
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
      ...filterVariables,
      ...options?.variables,
    },
  });

  const reserveRems = data?.reserveRems;
  const totalCount = data?.reserveRemsCount ?? 0;

  const handleFetchMore = () => {
    if ((reserveRems?.length ?? 0) < totalCount) {
      fetchMore({
        variables: {
          ...filterVariables,
          ...options?.variables,
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil((reserveRems?.length ?? 0) / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            ...fetchMoreResult,
            reserveRems: [
              ...(prev.reserveRems ?? []),
              ...(fetchMoreResult.reserveRems ?? []),
            ],
          };
        },
      });
    }
  };

  return {
    reserveRems,
    totalCount,
    loading,
    error,
    handleFetchMore,
  };
};
