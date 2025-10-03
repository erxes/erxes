import { gql } from '@apollo/client';

export const ACTIVITY_LOGS = gql`
  query activityLogs(
    $contentType: String!
    $contentId: String!
    $activityType: String
    $limit: Int
  ) {
    activityLogs(
      contentType: $contentType
      contentId: $contentId
      activityType: $activityType
      limit: $limit
    ) {
      _id
      action
      contentId
      contentType
      content
      createdAt
      createdBy
      createdByDetail
      contentDetail
      contentTypeDetail
      __typename
    }
  }
`;
