import { gql } from '@apollo/client';

export const CP_USERS_REMOVE = gql`
  mutation cpUsersRemove($ids: [String!]!) {
    cpUsersRemove(ids: $ids)
  }
`;
