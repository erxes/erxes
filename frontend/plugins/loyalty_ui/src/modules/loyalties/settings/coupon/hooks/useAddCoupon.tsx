import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { CREATE_COUPON_CAMPAIGN } from '../graphql/mutations/CouponMutations';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { COUPONS_PER_PAGE } from './useCoupons';

export interface AddCouponResult {
  createCampaign: any;
}

export interface AddCouponVariables {
  kind?: string;
  value?: number;
  description?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  conditions?: any;
  title?: string;
  buyScore?: number;
  count?: number;
  minimumSpend?: number;
  maximumSpend?: number;
  productCategory?: string;
  orExcludeProductCategory?: string;
  product?: string;
  orExcludeProduct?: string;
  tag?: string;
  orExcludeTag?: string;
  codeLength?: number;
  prefixUppercase?: string;
  pattern?: string;
  redemptionLimitPerUser?: number;
  characterSet?: string;
  numberOfCodes?: number;
  postfixUppercase?: string;
  usageLimit?: number;
  staticCode?: string;
}

export const useAddCoupon = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });
  const [addCoupon, { loading, error }] = useMutation<
    AddCouponResult,
    AddCouponVariables
  >(CREATE_COUPON_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_COUPON_CAMPAIGNS,
        variables: { limit: COUPONS_PER_PAGE, cursor },
      },
    ],
    update: (cache, { data }) => {
      try {
        const newCampaign = data?.createCampaign;

        if (!newCampaign) {
          return;
        }

        const existingData: any = cache.readQuery({
          query: QUERY_COUPON_CAMPAIGNS,
          variables: { limit: COUPONS_PER_PAGE, cursor },
        });

        if (!existingData?.couponCampaigns) {
          return;
        }

        cache.writeQuery({
          query: QUERY_COUPON_CAMPAIGNS,
          variables: { limit: COUPONS_PER_PAGE, cursor },
          data: {
            couponCampaigns: {
              ...existingData.couponCampaigns,
              list: [newCampaign, ...existingData.couponCampaigns.list],
              totalCount: (existingData.couponCampaigns.totalCount || 0) + 1,
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const couponAdd = async (
    options: MutationHookOptions<AddCouponResult, AddCouponVariables>,
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
