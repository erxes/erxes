import { gql } from '@apollo/client';

export const AUTH_PORTAL_LOGIN = gql`
  mutation authPortalLogin($email: String!, $password: String!) {
    clientPortalUserLoginWithCredentials(email: $email, password: $password)
  }
`;

export const AUTH_PORTAL_REGISTER = gql`
  mutation authPortalRegister(
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    clientPortalUserRegister(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
    ) {
      _id
      isVerified
    }
  }
`;

export const AUTH_PORTAL_LOGOUT = gql`
  mutation authPortalLogout {
    clientPortalLogout
  }
`;
