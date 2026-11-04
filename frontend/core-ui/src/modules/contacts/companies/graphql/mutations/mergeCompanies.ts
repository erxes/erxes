import { gql } from '@apollo/client';

export const COMPANIES_MERGE_MUTATION = gql`
  mutation CompaniesMerge($companyIds: [String], $companyFields: JSON) {
    companiesMerge(companyIds: $companyIds, companyFields: $companyFields) {
      _id
    }
  }
`;
