import { gql } from '@apollo/client';

export const CP_USERS_REMOVE = gql`
  mutation cpUsersRemove($_id: String!) {
    cpUsersRemove(_id: $_id) {
      _id
    }
  }
`;
