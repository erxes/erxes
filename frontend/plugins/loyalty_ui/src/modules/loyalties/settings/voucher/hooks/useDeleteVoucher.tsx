import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { removeVoucherMutation } from '../graphql/mutations/removeVoucherMutations';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { VOUCHERS_PER_PAGE } from './useVouchers';

export const useDeleteVoucher = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });

  const [removeVoucher, { loading }] = useMutation(removeVoucherMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: {
          kind: 'voucher',
          limit: VOUCHERS_PER_PAGE,
          cursor,
        },
      },
    ],
    update: (cache, { data }) => {
      try {
        const deletedCampaignIds = data?.removeCampaign?._id || [];

        if (!deletedCampaignIds.length) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: getCampaignsQuery,
          variables: { kind: 'voucher', limit: VOUCHERS_PER_PAGE, cursor },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: { kind: 'voucher', limit: VOUCHERS_PER_PAGE, cursor },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: existingData.getCampaigns.list.filter(
                (campaign: any) => !deletedCampaignIds.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.getCampaigns.totalCount || 0) -
                  deletedCampaignIds.length,
                0,
              ),
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
    awaitRefetchQueries: true,
  });

  return {
    removeVoucher,
    loading,
  };
};
