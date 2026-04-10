import { useQueryState } from 'erxes-ui';
import { GET_ACCOUNT_DETAIL } from '../graphql/queries/getAccounts';
import { useQuery } from '@apollo/client';

export const useAccountDetail = () => {
  const [accountId, setAccountId] = useQueryState('accountId');
  const { data, loading } = useQuery(GET_ACCOUNT_DETAIL, {
    variables: { id: accountId },
    skip: !accountId,
  });

  return {
    accountDetail: data?.accountDetail,
    loading,
    closeDetail: () => setAccountId(null),
  };
};
