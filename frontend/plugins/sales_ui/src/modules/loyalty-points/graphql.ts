import { gql } from '~/gql';

// Loyalty's entries by the ids a source linked; any source asks the same.
export const SALES_LOYALTY_SCORE_LOGS_BY_IDS = gql(`
  query SalesLoyaltyScoreLogsByIds($ids: [String!]!) {
    loyaltyScoreLogsByIds(ids: $ids) {
      _id
      action
      change
      description
      createdAt
      ownerId
      ownerType
      owner
      replacedByScoreLogId
      campaign {
        _id
        title
      }
    }
  }
`);
