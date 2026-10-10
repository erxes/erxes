import { toGraphqlView } from '@/utils/graphql';
import { useQueryState } from 'erxes-ui';
import { GET_ACCOUNT_DETAIL } from '../graphql/queries/getAccounts';
import { useQuery } from '@apollo/client';

export const useAccountDetail = () => {
  const [accountId, setAccountId] = useQueryState<string>('accountId');
  const { data: queryData, loading } = useQuery(GET_ACCOUNT_DETAIL, {
    variables: { id: accountId ?? '' },
    skip: !accountId,
  });
  const data = toGraphqlView(queryData);

  return {
    accountDetail: data?.accountDetail,
    loading,
    closeDetail: () => setAccountId(null),
  };
};
