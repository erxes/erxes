import { SAFE_REMAINDERS_QUERY } from '../graphql/safeRemainderQueries';
import { OperationVariables, useQuery } from '@apollo/client';
import { ACC_TRS__PER_PAGE } from '../../../transactions/types/constants';
import { parseDateRangeFromString, useMultiQueryState } from 'erxes-ui';

type SafeRemainderQueryParams = {
  searchValue: string;
  branchId: string;
  departmentId: string;
  date: string;
  createdUserId: string;
  modifiedUserId: string;
  createdDate: string;
  updatedDate: string;
};

const SAFE_REMAINDER_FILTER_KEYS: (keyof SafeRemainderQueryParams)[] = [
  'searchValue',
  'branchId',
  'departmentId',
  'date',
  'createdUserId',
  'modifiedUserId',
  'createdDate',
  'updatedDate',
];

export const useSafeRemainderQueryParams = () => {
  const [queryParams] =
    useMultiQueryState<SafeRemainderQueryParams>(SAFE_REMAINDER_FILTER_KEYS);
  return queryParams;
};

export const useSafeRemainderVariables = () => {
  const queryParams = useSafeRemainderQueryParams() || {};
  const variables: Record<string, any> = {};

  if (queryParams.searchValue) variables.searchValue = queryParams.searchValue;
  if (queryParams.branchId) variables.branchId = queryParams.branchId;
  if (queryParams.departmentId)
    variables.departmentId = queryParams.departmentId;
  if (queryParams.createdUserId)
    variables.createdUserId = queryParams.createdUserId;
  if (queryParams.modifiedUserId)
    variables.modifiedUserId = queryParams.modifiedUserId;

  const range = parseDateRangeFromString(queryParams.date);
  if (range) {
    variables.beginDate = range.from;
    variables.endDate = range.to;
  }

  const createdRange = parseDateRangeFromString(queryParams.createdDate);
  if (createdRange) {
    variables.createdStartDate = createdRange.from;
    variables.createdEndDate = createdRange.to;
  }

  const updatedRange = parseDateRangeFromString(queryParams.updatedDate);
  if (updatedRange) {
    variables.updatedStartDate = updatedRange.from;
    variables.updatedEndDate = updatedRange.to;
  }

  return variables;
};

export const useSafeRemainders = (options?: OperationVariables) => {
  const filterVariables = useSafeRemainderVariables();

  const { data, loading, error, fetchMore } = useQuery(SAFE_REMAINDERS_QUERY, {
    ...options,
    variables: {
      page: 1,
      perPage: ACC_TRS__PER_PAGE,
      ...filterVariables,
      ...options?.variables,
    },
  });
  const { remainders, totalCount } = data?.safeRemainders || {};

  const handleFetchMore = () => {
    if (remainders?.length < totalCount) {
      fetchMore({
        variables: {
          ...filterVariables,
          ...options?.variables,
          perPage: ACC_TRS__PER_PAGE,
          page: Math.ceil(remainders?.length / ACC_TRS__PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...fetchMoreResult,
            safeRemainders: {
              ...fetchMoreResult.safeRemainders,
              remainders: [
                ...(prev.safeRemainders?.remainders ?? []),
                ...(fetchMoreResult.safeRemainders?.remainders ?? []),
              ],
            },
          };
        },
      });
    }
  };

  return {
    safeRemainders: remainders,
    totalCount,
    loading,
    error,
    handleFetchMore,
  };
};
