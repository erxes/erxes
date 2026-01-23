import { gql } from '@apollo/client';

export const TRANSACTION_DETAIL_QUERY = gql`
  query accTransactionDetail($_id: String!) {
    accTransactionDetail(_id: $_id) {
      _id
      number
      date
      journal
      status
      customer {
        primaryEmail
      }
      details {
        amount
        currencyAmount
        account {
          extra
        }
      }
      extraData
      description
    }
  }
`;
