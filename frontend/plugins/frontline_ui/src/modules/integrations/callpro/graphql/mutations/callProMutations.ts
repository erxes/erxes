import { gql } from '~/gql';

export const CALL_PRO_CUSTOMER_SELECT = gql(`
  mutation callProCustomerSelect(
    $conversationId: String!
    $customerId: String!
  ) {
    callProCustomerSelect(
      conversationId: $conversationId
      customerId: $customerId
    ) {
      _id
      customerId
      callProPotentialCustomerIds
      callProPhone
    }
  }
`);
