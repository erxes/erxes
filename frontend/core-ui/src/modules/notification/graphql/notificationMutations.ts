import { gql } from '@apollo/client';

export const MARK_AS_READ_NOTIFICATION = gql`
  mutation MarkNotificationAsRead($id: String!) {
    markNotificationAsRead(_id: $id)
  }
`;
