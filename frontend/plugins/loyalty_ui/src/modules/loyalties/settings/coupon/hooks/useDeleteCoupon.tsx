import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { REMOVE_COUPON_CAMPAIGNS } from '../graphql/mutations/removeCouponMutations';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { COUPONS_PER_PAGE } from './useCoupons';

export const useDeleteCoupon = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });

  const [removeCoupon, { loading }] = useMutation(REMOVE_COUPON_CAMPAIGNS, {
    refetchQueries: [
      {
        query: QUERY_COUPON_CAMPAIGNS,
        variables: {
          limit: COUPONS_PER_PAGE,
          cursor,
        },
      },
    ],
    update: (cache, { data }) => {
      try {
        const deletedCampaign = data?.couponCampaignsRemove || {};

        if (!deletedCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_COUPON_CAMPAIGNS,
          variables: { limit: COUPONS_PER_PAGE, cursor },
        });

        if (!existingData?.getCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_COUPON_CAMPAIGNS,
          variables: { limit: COUPONS_PER_PAGE, cursor },
          data: {
            getCampaigns: {
              ...existingData.getCampaigns,
              list: existingData.getCampaigns.list.filter(
                (campaign: any) =>
                  !deletedCampaign?._ids?.includes(campaign._id),
              ),
              totalCount: Math.max(
                (existingData.getCampaigns.totalCount || 0) -
                  deletedCampaign?._ids?.length,
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
