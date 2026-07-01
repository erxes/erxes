import { gql } from '@apollo/client';

export const SETTINGS_APPROVAL_REQUESTS = gql`
  query SettingsApprovalRequests(
    $limit: Int
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $status: String
    $contentType: String
    $requesterIds: [String]
    $approverIds: [String]
  ) {
    approvalRequests(
      limit: $limit
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      status: $status
      contentType: $contentType
      requesterIds: $requesterIds
      approverIds: $approverIds
    ) {
      list {
        _id
        contentType
        contentId
        lockId
        requesterId
        reason
        status
        requiredApproverIds
        decisions {
          userId
          decision
          reason
          at
        }
        notificationIds
        createdAt
        resolvedAt
        content {
          contentType
          contentId
          label
          link
          ownerId
        }
        requester {
          _id
          email
          username
          details {
            fullName
            firstName
            lastName
            avatar
          }
        }
        requiredApprovers {
          _id
          email
          username
          details {
            fullName
            firstName
            lastName
            avatar
          }
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
