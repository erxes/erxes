import { gql } from '@apollo/client';

const invoiceSubscription = gql`
  subscription invoiceUpdated($_id: String!) {
    invoiceUpdated(_id: $_id) {
      _id
      status
    }
  }
`;

const subscriptions = { invoiceSubscription };

export default subscriptions;
