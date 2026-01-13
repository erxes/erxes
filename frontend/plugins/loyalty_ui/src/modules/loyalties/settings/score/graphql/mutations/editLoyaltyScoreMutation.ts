import { gql } from '@apollo/client';

export const editLoyaltyScoreMutation = gql`
  mutation ScoreCampaignUpdate($_id: String, $status: String) {
    scoreCampaignUpdate(_id: $_id, status: $status) {
      _id
      status
    }
  }
`;
