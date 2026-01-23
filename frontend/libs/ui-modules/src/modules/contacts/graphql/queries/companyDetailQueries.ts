import { gql } from '@apollo/client';

export const COMPANY_DETAIL = gql`
  query CompanyDetail($_id: String!) {
    companyDetail(_id: $_id) {
      _id
    avatar
    code
    createdAt
    primaryEmail
    primaryName
    primaryPhone
    ownerId
    customers {
      _id
      avatar
      firstName
      lastName
      middleName
    }
    names
    emails
    owner {
      _id
      username
    }
    description
    businessType
    }
  }
`;

export const COMPANY_INLINE = gql`
  query CompanyInline($_id: String!) {
    companyDetail(_id: $_id) {
      _id
      primaryEmail
      primaryPhone
      primaryName
      avatar
    }
  }
`;
