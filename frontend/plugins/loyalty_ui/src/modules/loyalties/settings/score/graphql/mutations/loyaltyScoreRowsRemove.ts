import { gql } from '@apollo/client';

export const LOYALTY_SCORE_ROW_REMOVE = gql`
  mutation ScoreCampaignsRemove($_ids: [String]) {
    scoreCampaignsRemove(_ids: $_ids)
  }
`;
