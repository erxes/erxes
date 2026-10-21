import { gql } from '@apollo/client';
import { CUSTOMER_RECORD_TABLE_FIELDS } from '../queries/getCustomers';

// Creates a customer or lead from its side panel draft and returns it as a
// table row.
export const CUSTOMERS_RECORD_TABLE_ADD = gql`
  mutation customersRecordTableAdd(
    $state: String
    $firstName: String
    $lastName: String
    $primaryEmail: String
    $primaryPhone: String
  ) {
    customersAdd(
      state: $state
      firstName: $firstName
      lastName: $lastName
      primaryEmail: $primaryEmail
      primaryPhone: $primaryPhone
    ) {
      ${CUSTOMER_RECORD_TABLE_FIELDS}
    }
  }
`;
