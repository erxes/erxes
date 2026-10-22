import { gql } from '@apollo/client';

export const MARK_AS_READ_NOTIFICATION = gql`
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(_id: $id)
  }
`;

export const CORE_NOTIFICATIONS_DELETE = gql`
  mutation coreNotificationsDelete($ids: [String!]!) {
    coreNotificationsDelete(ids: $ids)
  }
`;
