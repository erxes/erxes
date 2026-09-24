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

export const AUTH_PORTAL_USER_EDIT = gql`
  mutation authPortalUserEdit(
    $firstName: String
    $lastName: String
    $username: String
    $email: String
    $phone: String
    $avatar: String
    $companyName: String
  ) {
    clientPortalUserEdit(
      firstName: $firstName
      lastName: $lastName
      username: $username
      email: $email
      phone: $phone
      avatar: $avatar
      companyName: $companyName
    ) {
      _id
      email
      phone
      firstName
      lastName
      username
      avatar
      companyName
      isVerified
      erxesCustomerId
    }
  }
`;

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

export const AUTH_PORTAL_CHANGE_PASSWORD = gql`
  mutation authPortalChangePassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    clientPortalUserChangePassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      _id
    }
  }
`;

export const AUTH_PORTAL_LOGOUT = gql`
  mutation authPortalLogout {
    clientPortalLogout
  }
`;
