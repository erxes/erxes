import { gql } from '@apollo/client';

export const USER_STATUS_CHANGED = gql`
  subscription UserStatusChanged($_id: String) {
    userStatusChanged(_id: $_id) {
      _id
      isActive
      email
      username
      details {
        avatar
        fullName
      }
    }
  }
`;
