import { gql } from '@apollo/client';

export const CLIENT_PORTAL_SEND_NOTIFICATION = gql`
  mutation clientPortalSendNotification(
    $cpUserId: String!
    $clientPortalId: String!
    $input: CPNotificationSendInput!
  ) {
    clientPortalSendNotification(
      cpUserId: $cpUserId
      clientPortalId: $clientPortalId
      input: $input
    ) {
      _id
      title
      message
      type
      priority
      kind
      isRead
      createdAt
    }
  }
`;
