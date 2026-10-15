import type {
  GetVoucherCampaignQuery,
  VoucherCampaignsQuery,
} from '~/gql/graphql';

export type IVoucher = NonNullable<
  NonNullable<
    NonNullable<VoucherCampaignsQuery['voucherCampaigns']>['list']
  >[number]
>;

export type IVoucherDetail = NonNullable<
  GetVoucherCampaignQuery['voucherCampaignDetail']
>;
