import { gql } from '@apollo/client';

export const UPDATE_SCORE_CAMPAIGN = gql`
  mutation updateScoreCampaign(
    $_id: String
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
    scoreCampaignUpdate(
      _id: $_id
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
    ) {
      _id
      title
      description
      add
      subtract
      createdAt
      createdUserId
      status
      ownerType
      fieldGroupId
      fieldName
      fieldId
      serviceName
      additionalConfig
      restrictions
      onlyClientPortal
    }
  }
`;
