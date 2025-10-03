import { gql } from '@apollo/client';

export const CUSTOMERS_REMOVE = gql`
  mutation CustomersRemove($customerIds: [String]) {
    customersRemove(customerIds: $customerIds)
  }
`;
