import { useQuery, OperationVariables } from '@apollo/client';
import { GET_ACCOUNTS } from '../graphql/queries/getAccounts';
import { useMultiQueryState } from 'erxes-ui';
export const ACCOUNTS_PER_PAGE = 20;

export const useAccounts = (options?: OperationVariables) => {
  const [queries] = useMultiQueryState<{
    code?: string;
    name?: string;
    categoryId?: string;
    currency?: string;
    kind?: string;
    journal?: string;
  }>(['code', 'name', 'categoryId', 'currency', 'kind', 'journal']);

  const variables = Object.entries(queries).reduce((acc, [key, value]) => {
    if (value) {
      acc[key] = value + '';
    }
    return acc;
  }, {} as Record<string, string>);

  const { data, loading, error, fetchMore } = useQuery(GET_ACCOUNTS, {
    ...options,
    variables: {
      page: 1,
      perPage: ACCOUNTS_PER_PAGE,
      ...variables,
      ...options?.variables,
    },
  });
  const { accounts, accountsCount: totalCount } = data || {};
  const handleFetchMore = () => {
    if (accounts?.length < totalCount) {
      fetchMore({
        variables: {
          perPage: ACCOUNTS_PER_PAGE,
          page: Math.ceil(accounts?.length / ACCOUNTS_PER_PAGE) + 1,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          return {
            ...prev,
            ...fetchMoreResult,
            accounts: [...prev.accounts, ...fetchMoreResult.accounts],
          };
        },
      });
    }
  };

  return {
    accounts,
    loading,
    error,
    handleFetchMore,
    totalCount,
  };
};
