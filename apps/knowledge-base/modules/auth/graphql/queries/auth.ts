import { gql } from '@apollo/client';

export const AUTH_PORTAL_CURRENT_USER = gql`
  query authPortalCurrentUser {
    clientPortalCurrentUser {
      _id
      email
      firstName
      lastName
      username
      isVerified
    }
  }
`;
