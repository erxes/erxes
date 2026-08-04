import { gql } from '@apollo/client';

export const REMOVE_LOTTERY_CAMPAIGN = gql`
  mutation RemoveLotteryCampaign($_ids: [String]!) {
    lotteryCampaignsRemove(_ids: $_ids)
  }
`;
