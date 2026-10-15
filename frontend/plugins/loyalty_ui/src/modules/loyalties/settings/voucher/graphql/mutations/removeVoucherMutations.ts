import { gql } from '~/gql';

export const REMOVE_VOUCHER_CAMPAIGN = gql(`
  mutation RemoveVoucherCampaign($_ids: [String!]!) {
    voucherCampaignsRemove(_ids: $_ids)
  }
`);
