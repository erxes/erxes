import { accountFields } from "../../settings/accounts/graphql/queries";
import { ctaxRowFields } from "../../settings/ctaxRows/graphql/queries";
import { vatRowFields } from "../../settings/vatRows/graphql/queries";

const followTrType = `
  type
  id
`;

export const commonTrDetailFields = `
  _id
  accountId
  transactionId
  originId
  followInfos
  follows {
    ${followTrType}
  }

  side
  amount
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

  branch {
    _id
    title
  }

  department {
    _id
    title
  }

  details {
    ${commonTrDetailFields}
    account {
      ${accountFields}
    }
  }
  shortDetail {
    ${commonTrDetailFields}
    account {
      ${accountFields}
    }
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

  hasVat
  vatRowId
  afterVat
  isHandleVat
  vatAmount
  vatRow {
    ${vatRowFields}
  }

  hasCtax
  ctaxRowId
  isHandleCtax
  ctaxAmount
  ctaxRow {
    ${ctaxRowFields}
  }

  permission
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
  query accTransactions(${accountsFilterParamDefs}, ${commonParamDefs}) {
    accTransactions(${accountsFilterParams}, ${commonParams}) {
      ${commonTransactionFields}
    }
  }
`;

const transactionDetail = `
  query accTransactionDetail($_id: String!) {
    accTransactionDetail(_id: $_id) {
      ${commonTransactionFields}
    }
  }
`;

const transactionsCount = `
  query accTransactionsCount(${accountsFilterParamDefs}) {
    accTransactionsCount(${accountsFilterParams})
  }
`;

export default {
  transactions,
  transactionsCount,
  transactionDetail,
  // ptrs,
  // oddTransactions
};
