import { gql } from '@apollo/client';

export const CUSTOMERS_CHANGE_VERIFICATION_STATUS = gql`
  mutation CustomersChangeVerificationStatus(
    $customerIds: [String]
    $type: String!
    $status: String!
  ) {
    customersChangeVerificationStatus(
      customerIds: $customerIds
      type: $type
      status: $status
    ) {
      _id
    }
  }
`;
