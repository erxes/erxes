import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_ACCOUNT_CATEGORY_DETAIL } from '@/settings/account/account-categories/graphql/queries/getAccountCategory';

export const useAccountCategoryDetail = (accountCategoryId?: string) => {
  const { data: queryData, loading } = useQuery(GET_ACCOUNT_CATEGORY_DETAIL, {
    variables: { id: accountCategoryId ?? '' },
    skip: !accountCategoryId,
  });
  const data = toGraphqlView(queryData);

  return {
    accountCategoryDetail: data?.accountCategoryDetail,
    loading,
  };
};
