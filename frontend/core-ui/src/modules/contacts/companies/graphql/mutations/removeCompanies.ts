import { gql } from '@apollo/client';

export const REMOVE_COMPANIES = gql`
  mutation RemoveCompanies($companyIds: [String]) {
    companiesRemove(companyIds: $companyIds)
  }
`;
