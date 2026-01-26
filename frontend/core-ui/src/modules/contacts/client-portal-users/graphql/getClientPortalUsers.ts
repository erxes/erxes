import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';

export const GET_CLIENT_PORTAL_USERS = gql`
  query getClientPortalUsers($filter: IClientPortalUserFilter) {
    getClientPortalUsers(filter: $filter) {
      list {
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
        lastLoginAt
        createdAt
        updatedAt
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
