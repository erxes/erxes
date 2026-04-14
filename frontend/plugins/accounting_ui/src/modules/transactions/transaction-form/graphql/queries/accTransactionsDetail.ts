import { gql } from '@apollo/client';
import { commonTransactionFields } from '@/transactions/graphql/transactionQueries';

export const TRANSACTIONS_DETAIL_QUERY = gql`
  query AccTransactionsDetail($_id: String!) {
    accTransactionsDetail(_id: $_id) {
      ${commonTransactionFields}
    }
  }
`;
