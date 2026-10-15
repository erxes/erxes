import type {
  GetCouponCampaignQuery,
  GetCouponCampaignsQuery,
} from '~/gql/graphql';

export type ICoupon = NonNullable<
  NonNullable<
    NonNullable<GetCouponCampaignsQuery['couponCampaigns']>['list']
  >[number]
>;

export type ICouponDetail = NonNullable<
  GetCouponCampaignQuery['couponCampaign']
>;
