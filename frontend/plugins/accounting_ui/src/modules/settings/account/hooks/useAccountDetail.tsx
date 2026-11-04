import { toGraphqlView } from '@/utils/graphql';
import { GET_ACCOUNT_DETAIL } from '@/settings/account/graphql/queries/getAccounts';
import { useQuery } from '@apollo/client';

export const useAccountDetail = (accountId?: string) => {
  const { data: queryData, loading } = useQuery(GET_ACCOUNT_DETAIL, {
    variables: { id: accountId ?? '' },
    skip: !accountId,
  });
  const data = toGraphqlView(queryData);

  return {
    accountDetail: data?.accountDetail,
    loading,
  };
};
