import { gql } from '@apollo/client';

export const CP_USERS_VERIFY = gql`
  mutation cpUsersVerify($type: String, $userIds: [String]!) {
    cpUsersVerify(type: $type, userIds: $userIds)
  }
`;
