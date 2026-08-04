import { gql } from '@apollo/client';

export const REMOVE_SPIN_CAMPAIGN = gql`
  mutation RemoveSpinCampaign($_ids: [String]!) {
    spinCampaignsRemove(_ids: $_ids)
  }
`;
