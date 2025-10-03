import { useQueryState } from 'erxes-ui';
import { accountDetailAtom } from '../states/accountStates';
import { useAtomValue } from 'jotai';
import { GET_ACCOUNT_DETAIL } from '../graphql/queries/getAccounts';
import { useQuery } from '@apollo/client';

export const useAccountDetail = () => {
  const [accountId, setAccountId] = useQueryState('accountId');
  const accountDetail = useAtomValue(accountDetailAtom);
  const { data, loading } = useQuery(GET_ACCOUNT_DETAIL, {
    variables: { id: accountId },
    skip: !!accountDetail || !accountId,
  });

  return {
    accountDetail:
      accountDetail && accountDetail?._id === accountId
        ? accountDetail
        : data?.accountDetail,
    loading,
    closeDetail: () => setAccountId(null),
  };
};
