import { gql } from '@apollo/client';

export const REMOVE_DONATE_CAMPAIGN = gql`
  mutation RemoveDonateCampaign($_ids: [String]) {
    donateCampaignsRemove(_ids: $_ids)
  }
`;
