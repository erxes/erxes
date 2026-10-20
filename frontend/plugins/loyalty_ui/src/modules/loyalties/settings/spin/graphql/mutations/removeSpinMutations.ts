import { gql } from '~/gql';

export const REMOVE_SPIN_CAMPAIGN = gql(`
  mutation RemoveSpinCampaign($_ids: [String!]!) {
    spinCampaignsRemove(_ids: $_ids)
  }
`);
