import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { REMOVE_VOUCHER_CAMPAIGN } from '../graphql/mutations/removeVoucherMutations';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { VOUCHERS_PER_PAGE } from './useVouchers';

export const useDeleteVoucher = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });

  const [removeVoucher, { loading }] = useMutation(REMOVE_VOUCHER_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_VOUCHER_CAMPAIGNS,
        variables: {
          limit: VOUCHERS_PER_PAGE,
          cursor,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    removeVoucher,
    loading,
  };
};
