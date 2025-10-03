import { gql } from '@apollo/client';

export const CUSTOMERS_MERGE_MUTATION = gql`
  mutation CustomersMerge($customerIds: [String], $customerFields: JSON) {
    customersMerge(customerIds: $customerIds, customerFields: $customerFields) {
      _id
    }
  }
`;
