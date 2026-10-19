import { gql } from '@apollo/client';
import { CUSTOMER_RECORD_TABLE_FIELDS } from '../queries/getCustomers';

// Creates an empty customer or lead and returns it as a table row.
export const CUSTOMERS_RECORD_TABLE_ADD = gql`
  mutation customersRecordTableAdd($state: String) {
    customersAdd(state: $state) {
      ${CUSTOMER_RECORD_TABLE_FIELDS}
    }
  }
`;
