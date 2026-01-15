import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { removeCouponMutation } from '../graphql/mutations/removeCouponMutations';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { COUPONS_PER_PAGE } from './useCoupons';

export const useDeleteCoupon = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });

  const [removeCoupon, { loading }] = useMutation(removeCouponMutation, {
    refetchQueries: [
      {
        query: getCampaignsQuery,
        variables: {
          kind: 'coupon',
          limit: COUPONS_PER_PAGE,
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
          variables: { kind: 'coupon', limit: COUPONS_PER_PAGE, cursor },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: getCampaignsQuery,
          variables: { kind: 'coupon', limit: COUPONS_PER_PAGE, cursor },
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
    removeCoupon,
    loading,
  };
};
