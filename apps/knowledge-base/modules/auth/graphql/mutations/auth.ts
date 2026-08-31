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

/**
 * Writes the requester's contact details onto the customer record erxes links
 * to this portal account, which is where an agent reads them beside a ticket.
 */
export const AUTH_PORTAL_CUSTOMER_EDIT = gql`
  mutation authPortalCustomerEdit(
    $firstName: String
    $lastName: String
    $primaryPhone: String
  ) {
    clientPortalCustomerEdit(
      firstName: $firstName
      lastName: $lastName
      primaryPhone: $primaryPhone
    ) {
      _id
      firstName
      lastName
      primaryEmail
      primaryPhone
    }
  }
`;

export const AUTH_PORTAL_LOGOUT = gql`
  mutation authPortalLogout {
    clientPortalLogout
  }
`;
