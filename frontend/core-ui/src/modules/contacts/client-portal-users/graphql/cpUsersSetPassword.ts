import { gql } from '@apollo/client';

export const CP_USERS_SET_PASSWORD = gql`
  mutation cpUsersSetPassword($_id: String!, $newPassword: String!) {
    cpUsersSetPassword(_id: $_id, newPassword: $newPassword) {
      _id
    }
  }
`;
