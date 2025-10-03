import { OperationVariables, useQuery } from '@apollo/client';
import { GET_ACCOUNT_CATEGORIES } from '../graphql/queries/getAccountCategory';
import { IAccountCategory } from '../types/AccountCategory';

export const useAccountCategories = (options?: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    accountCategories: IAccountCategory[];
  }>(GET_ACCOUNT_CATEGORIES, options);
  return { accountCategories: data?.accountCategories, loading, error };
};
