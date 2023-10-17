export const transactionPreInfo = `
  contractId
  number
  payDate
  payment
  total
`;
export const transactionFields = `
  _id
  createdAt
  createdBy
  customerId
  companyId
  invoiceId
  status
  description
  ${transactionPreInfo}
  storedInterest
`;

export const transactionOtherFields = `
  contract {
    number
  }
  transactionType
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $contractId: String
  $customerId: String
  $companyId: String
  $startDate: String
  $endDate: String
  $searchValue: String
  $payDate: String
  $contractHasnt: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  contractId: $contractId
  customerId: $customerId
  companyId: $companyId
  startDate: $startDate
  endDate: $endDate
  searchValue: $searchValue
  payDate: $payDate
  contractHasnt: $contractHasnt
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const transactions = `
  query savingsTransactions(${listParamsDef}) {
    savingsTransactions(${listParamsValue}) {
      ${transactionFields}
    }
  }
`;

export const transactionsMain = `
  query savingsTransactionsMain(${listParamsDef}) {
    savingsTransactionsMain(${listParamsValue}) {
      list {
        ${transactionFields}
        ${transactionOtherFields}
      }
      totalCount
    }
  }
`;

export const transactionCounts = `
  query savingsTransactionCounts(${listParamsDef}, $only: String) {
    savingsTransactionCounts(${listParamsValue}, only: $only)
  }
`;

export const transactionDetail = `
  query savingsTransactionDetail($_id: String!) {
    savingsTransactionDetail(_id: $_id) {
      ${transactionFields}
      ${transactionOtherFields}
    }
  }
`;

export default {
  transactions,
  transactionsMain,
  transactionCounts,
  transactionDetail
};
