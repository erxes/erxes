const followTrType = `
  type
  id
`;

export const commonTrDetailFields = `
  _id
  accountId
  transactionId
  originId
  follows {
    ${followTrType}
  }

  side
  amount
  currency
  currencyAmount
  customRate
  assignedUserId

  productId
  count
  unitPrice
`;

export const commonTransactionFields = `
  _id
  ptrId
  parentId
  number
  ptrStatus
  createdAt
  modifiedAt

  date
  description
  status
  journal
  originId
  follows {
    ${followTrType}
  }

  branchId
  departmentId
  customerType
  customerId
  assignedUserIds

  details {
    ${commonTrDetailFields}
  }
  shortDetail {
    ${commonTrDetailFields}
  }
  sumDt
  sumCt
  createdBy
  modifiedBy

  followTrs {
    _id
    ptrId
    parentId
    number
    ptrStatus
    details {
      ${commonTrDetailFields}
    }
    shortDetail {
      ${commonTrDetailFields}
    }
    sumDt
    sumCt
  }
`;

const accountsFilterParamDefs = `
  $ids: [String],
  $excludeIds: Boolean,
  $status: String,
  $searchValue: String,
  $number: String,

  $accountIds: [String],
  $accountType: String,
  $accountExcludeIds: Boolean,
  $accountStatus: String,
  $accountCategoryId: String,
  $accountSearchValue: String,
  $accountBrand: String,
  $accountIsOutBalance: Boolean,
  $accountBranchId: String,
  $accountDepartmentId: String,
  $accountCurrency: String,
  $accountJournal: String,

  $brandId: String,
  $isOutBalance: Boolean,
  $branchId: String,
  $departmentId: String,
  $currency: String,
  $journal: String,
  $statuses: [String],
`;
const accountsFilterParams = `
  ids: $ids,
  excludeIds: $excludeIds,
  status: $status,
  searchValue: $searchValue,
  number: $number,

  accountIds: $accountIds,
  accountType: $accountType,
  accountExcludeIds: $accountExcludeIds,
  accountStatus: $accountStatus,
  accountCategoryId: $accountCategoryId,
  accountSearchValue: $accountSearchValue,
  accountBrand: $accountBrand,
  accountIsOutBalance: $accountIsOutBalance,
  accountBranchId: $accountBranchId,
  accountDepartmentId: $accountDepartmentId,
  accountCurrency: $accountCurrency,
  accountJournal: $accountJournal,

  brandId: $brandId,
  isOutBalance: $isOutBalance,
  branchId: $branchId,
  departmentId: $departmentId,
  currency: $currency,
  journal: $journal,
  statuses: $statuses,
`;

const commonParamDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
  sortField: $sortField,
  sortDirection: $sortDirection
`;

const transactions = `
  query transactions(${accountsFilterParamDefs}, ${commonParamDefs}) {
    transactions(${accountsFilterParams}, ${commonParams}) {
      ${commonTransactionFields}
    }
  }
`;

const transactionDetail = `
  query transactionDetail($_id: String!) {
    transactionDetail(_id: $_id) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsCount = `
  query transactionsCount(${accountsFilterParamDefs}) {
    transactionsCount(${accountsFilterParams})
  }
`;

export default {
  transactions,
  transactionsCount,
  transactionDetail,
  // ptrs,
  // oddTransactions
};
