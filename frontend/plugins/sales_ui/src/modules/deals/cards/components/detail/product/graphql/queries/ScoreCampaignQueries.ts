import { gql } from '@apollo/client';

export const CHECK_OWNER_SCORE = gql`
  query checkOwnerScore(
    $ownerId: String
    $ownerType: String
    $campaignId: String
  ) {
    checkOwnerScore(
      ownerId: $ownerId
      ownerType: $ownerType
      campaignId: $campaignId
    )
  }
`;
