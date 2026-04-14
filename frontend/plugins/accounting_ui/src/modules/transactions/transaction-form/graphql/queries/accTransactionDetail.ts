import { gql } from '@apollo/client';
import { commonTransactionFields } from '@/transactions/graphql/transactionQueries';

export const TRANSACTION_DETAIL_QUERY = gql`
  query accTransactionDetail($_id: String!) {
    accTransactionDetail(_id: $_id) {
      ${commonTransactionFields}
      customer {
        _id
        code
        primaryPhone
        firstName
        primaryEmail
        lastName
      }
    }
  }
`;
