import { nonBalanceTransactionFields, nonBalanceTransactionOtherFields } from './queries';

const commonFields = `
  $contractId: String,
  $customerId: String,
  $description: String,
  $number: String,
  $transactionType: String,
  $detail:[JSON]
`;

const commonVariables = `
  contractId: $contractId,
  customerId: $customerId,
  description: $description,
  transactionType: $transactionType,
  number: $number,
  detail: $detail
`;

const nonBalanceTransactionsAdd = `
  mutation nonBalanceTransactionsAdd(${commonFields}) {
    nonBalanceTransactionsAdd(${commonVariables}) {
      _id
      ${nonBalanceTransactionFields}
      ${nonBalanceTransactionOtherFields}
    }
  }
`;

const nonBalanceTransactionsRemove = `
  mutation NonBalanceTransactionsRemove($nonBalanceTransactionIds: [String]) {
    nonBalanceTransactionsRemove(nonBalanceTransactionIds: $nonBalanceTransactionIds)
  }
`;

export default {
  nonBalanceTransactionsAdd,
  nonBalanceTransactionsRemove
};
