import { gql } from '@apollo/client';

export const EBARIMT_GET_COMPANY = gql`
  query EbarimtGetCompany($companyRD: String!) {
    ebarimtGetCompany(companyRD: $companyRD)
  }
`;
