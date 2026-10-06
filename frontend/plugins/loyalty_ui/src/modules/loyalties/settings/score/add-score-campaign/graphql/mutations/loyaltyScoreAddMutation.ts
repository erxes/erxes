import { gql } from '@apollo/client';

export const CREATE_SCORE_CAMPAIGN = gql`
  mutation CreateScoreCampaign(
    $title: String
    $description: String
    $order: Int
    $add: JSON
    $subtract: JSON
    $createdAt: Date
    $createdUserId: String
    $status: String
    $accountTypeId: String
    $additionalConfig: JSON
    $restrictions: JSON
  ) {
    scoreCampaignAdd(
      title: $title
      description: $description
      order: $order
      add: $add
      subtract: $subtract
      createdAt: $createdAt
      createdUserId: $createdUserId
      status: $status
      accountTypeId: $accountTypeId
      additionalConfig: $additionalConfig
      restrictions: $restrictions
    )
  }
`;
