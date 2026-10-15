import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateCouponCampaignMutation,
  CreateCouponCampaignMutationVariables,
} from '~/gql/graphql';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { CREATE_COUPON_CAMPAIGN } from '../graphql/mutations/CouponMutations';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { COUPONS_PER_PAGE } from './useCoupons';

export const useAddCoupon = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });
  const [addCoupon, { loading, error }] = useMutation(CREATE_COUPON_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_COUPON_CAMPAIGNS,
        variables: { limit: COUPONS_PER_PAGE, cursor },
      },
    ],
  });

  const couponAdd = async (
    options: MutationHookOptions<
      CreateCouponCampaignMutation,
      CreateCouponCampaignMutationVariables
    >,
  ) => {
    return addCoupon({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('coupon-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    couponAdd,
    loading,
    error,
  };
};
