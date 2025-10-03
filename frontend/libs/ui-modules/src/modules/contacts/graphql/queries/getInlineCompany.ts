import { gql } from '@apollo/client';

export const COMPANY_INLINE = gql`
  query CompanyDetail($_id: String!) {
    companyDetail(_id: $_id) {
      _id
      avatar
      primaryName
      names
      primaryEmail
    }
  }
`;
