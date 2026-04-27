import { gql } from '@apollo/client';

export const USER_CONFIRM_INVITATION = gql`
  mutation UsersConfirmInvitation($token: String) {
    usersConfirmInvitation(token: $token)
  }
`;
