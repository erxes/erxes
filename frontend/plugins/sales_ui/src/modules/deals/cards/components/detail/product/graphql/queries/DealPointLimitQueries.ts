import { gql } from '@apollo/client';

// Asked of loyalty, which owns the spending rules.
export const SALES_DEAL_POINT_LIMIT = gql`
  query SalesDealPointLimit(
    $campaignId: String!
    $ownerType: String!
    $ownerId: String!
    $totalAmount: Float
    $targetId: String
  ) {
    loyaltyScoreSpendLimit(
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
      totalAmount: $totalAmount
      targetId: $targetId
    ) {
      balance
      pointValue
      maxAmount
      step
      blocked
    }
  }
`;
