import { gql } from '@apollo/client';

export const USER_CHANGE_PASSWORD = gql`
  mutation usersChangePassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    usersChangePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      _id
    }
  }
`;
