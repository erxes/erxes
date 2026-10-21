import { gql } from '@apollo/client';
import { COMPANY_RECORD_TABLE_FIELDS } from '../queries/getCompanies';

// Creates a company from its side panel draft and returns it as a table row.
export const COMPANIES_RECORD_TABLE_ADD = gql`
  mutation companiesRecordTableAdd(
    $primaryName: String
    $primaryEmail: String
    $primaryPhone: String
  ) {
    companiesAdd(
      primaryName: $primaryName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
    ) {
      ${COMPANY_RECORD_TABLE_FIELDS}
    }
  }
`;
