import { gql } from '@apollo/client';

export const CREATE_SCORE_CAMPAIGN = gql`
  mutation CreateScoreCampaign(
    $title: String
    $description: String
    $add: JSON
    $subtract: JSON
    $createdAt: Date
    $createdUserId: String
    $status: String
    $ownerType: String
    $fieldGroupId: String
    $fieldName: String
    $fieldId: String
    $fieldOrigin: String
    $serviceName: String
    $additionalConfig: JSON
    $restrictions: JSON
    $onlyClientPortal: Boolean
  ) {
    scoreCampaignAdd(
      title: $title
      description: $description
      add: $add
      subtract: $subtract
      createdAt: $createdAt
      createdUserId: $createdUserId
      status: $status
      ownerType: $ownerType
      fieldGroupId: $fieldGroupId
      fieldName: $fieldName
      fieldId: $fieldId
      fieldOrigin: $fieldOrigin
      serviceName: $serviceName
      additionalConfig: $additionalConfig
      restrictions: $restrictions
      onlyClientPortal: $onlyClientPortal
    )
  }
`;
