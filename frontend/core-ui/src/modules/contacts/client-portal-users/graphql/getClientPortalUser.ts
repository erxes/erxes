import { gql } from '@apollo/client';

export const GET_CLIENT_PORTAL_USER = gql`
  query getClientPortalUser($_id: String!) {
    getClientPortalUser(_id: $_id) {
      _id
      avatar
      type
      email
      phone
      username
      firstName
      lastName
      companyName
      companyRegistrationNumber
      clientPortalId
      erxesCustomerId
      isVerified
      isPhoneVerified
      isEmailVerified
      failedLoginAttempts
      accountLockedUntil
      lastLoginAt
      primaryAuthMethod
      fcmTokens { deviceId token platform }
      createdAt
      updatedAt
    }
  }
`;
