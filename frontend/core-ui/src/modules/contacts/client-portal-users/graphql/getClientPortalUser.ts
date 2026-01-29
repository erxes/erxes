import { gql } from '@apollo/client';

export const GET_CLIENT_PORTAL_USER = gql`
  query getClientPortalUser($_id: String!) {
    getClientPortalUser(_id: $_id) {
      _id
      type
      email
      phone
      username
      firstName
      lastName
      companyName
      companyRegistrationNumber
      clientPortalId
      isVerified
      isPhoneVerified
      isEmailVerified
      failedLoginAttempts
      accountLockedUntil
      lastLoginAt
      primaryAuthMethod
      createdAt
      updatedAt
    }
  }
`;
