import { gql } from '@apollo/client';

export const CUSTOMERS_CHANGE_STATE_BULK = gql`
  mutation CustomersChangeStateBulk($_ids: [String]!, $value: String!) {
    customersChangeStateBulk(_ids: $_ids, value: $value)
  }
`;
