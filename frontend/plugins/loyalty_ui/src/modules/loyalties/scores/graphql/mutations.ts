import { gql } from '@apollo/client';

export const CHANGE_SCORE_MUTATION = gql`
  mutation ChangeScore(
    $ownerType: String!
    $ownerId: String!
    $campaignId: String
    $targetId: String
    $action: String!
    $change: Float!
    $description: String
    $serviceName: String
  ) {
    changeScore(
      ownerType: $ownerType
      ownerId: $ownerId
      campaignId: $campaignId
      targetId: $targetId
      action: $action
      change: $change
      description: $description
      serviceName: $serviceName
    ) {
      _id
      ownerId
      ownerType
      change
      action
      description
      createdAt
    }
  }
`;

export const LOYALTY_SCORE_REPAIR_OWNER_MUTATION = gql`
  mutation LoyaltyScoreRepairOwner($ownerId: String!, $ownerType: String!) {
    loyaltyScoreRepairOwner(ownerId: $ownerId, ownerType: $ownerType)
  }
`;
