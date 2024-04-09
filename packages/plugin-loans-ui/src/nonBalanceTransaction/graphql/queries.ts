
export const detail = `
  ktAmount
  dtAmount
  type
  currency
`;
export const nonBalanceTransactionFields = `
  _id
  createdAt
  createdBy
  contractId
  customerId
  description
  number
  transactionType
`;

export const nonBalanceTransactionOtherFields = `
  contract {
    _id
    number
    status
    description
    createdBy
    createdAt
    leaseAmount
    tenor
    interestRate
    repayment
    startDate
    scheduleDays
  }
  customer {
    _id
    code
    firstName
    lastName
    middleName
    primaryEmail
    primaryPhone
  }
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $contractId: String
  $customerId: String
  $startDate: String
  $endDate: String
  $searchValue: String
  $sortField: String
  $sortDirection: Int
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  contractId: $contractId
  customerId: $customerId
  startDate: $startDate
  endDate: $endDate
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const nonBalanceTransactions = `
  query nonBalanceTransactions(${listParamsDef}) {
    nonBalanceTransactions(${listParamsValue}) {
      ${nonBalanceTransactionFields}
    }
  }
`;

export const nonBalanceTransactionsMain = `
  query NonBalanceTransactionsMain(${listParamsDef}) {
    nonBalanceTransactionsMain(${listParamsValue}) {
      list {
        ${nonBalanceTransactionFields}
        ${nonBalanceTransactionOtherFields}
      }
      totalCount
    }
  }
`;

export default {
  nonBalanceTransactions,
  nonBalanceTransactionsMain,
};
