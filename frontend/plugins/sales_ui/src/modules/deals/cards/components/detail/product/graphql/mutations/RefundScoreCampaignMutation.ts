import { gql } from '@apollo/client';

export const REFUND_SCORE_CAMPAIGN_MUTATION = gql`
  mutation RefundLoyaltyScore(
    $ownerId: String
    $ownerType: String
    $targetId: String
  ) {
    refundLoyaltyScore(
      ownerId: $ownerId
      ownerType: $ownerType
      targetId: $targetId
    )
  }
`;
