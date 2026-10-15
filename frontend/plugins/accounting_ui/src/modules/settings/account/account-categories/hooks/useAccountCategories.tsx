import type {
  AccountingAccountCategoriesQuery,
  AccountingAccountCategoriesQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_CATEGORIES } from '../graphql/queries/getAccountCategory';

export const useAccountCategories = (
  options?: QueryHookOptions<
    AccountingAccountCategoriesQuery,
    AccountingAccountCategoriesQueryVariables
  >,
) => {
  const {
    data: queryData,
    loading,
    error,
  } = useQuery(GET_ACCOUNT_CATEGORIES, options);
  const data = toGraphqlView(queryData);
  return { accountCategories: data?.accountCategories, loading, error };
};
