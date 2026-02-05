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
    update: (cache, { data }) => {
      try {
        const deletedCampaignIds = data?.voucherCampaignsRemove || {};

        if (!deletedCampaignIds.length) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_VOUCHER_CAMPAIGNS,
          variables: { limit: VOUCHERS_PER_PAGE, cursor },
        });

        if (!existingData?.voucherCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_VOUCHER_CAMPAIGNS,
          variables: { limit: VOUCHERS_PER_PAGE, cursor },
          data: {
            voucherCampaigns: {
              ...existingData.voucherCampaigns,
              list: existingData.voucherCampaigns.list.filter(
                (campaign: any) => !deletedCampaignIds.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.voucherCampaigns.totalCount || 0) -
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
