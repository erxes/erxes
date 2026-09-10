import { gql } from '@apollo/client';

export const AUTH_PORTAL_CURRENT_USER = gql`
  query authPortalCurrentUser {
    clientPortalCurrentUser {
      _id
      email
      phone
      firstName
      lastName
      username
      isVerified
      erxesCustomerId
    }
  }
`;
