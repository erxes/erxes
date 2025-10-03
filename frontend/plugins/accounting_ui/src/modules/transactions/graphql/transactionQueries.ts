import { gql } from '@apollo/client';

const followTrType = `
  type
  id
`;

export const commonTrDetailFields = `
  _id
  accountId
  transactionId
  originId
  followType
  originSubId
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
  updatedAt

  date
  description
  status
  journal
  originId
  followType
  originSubId
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
    code
    title
  }

  department {
    _id
    code
    title
  }

  details {
    ${commonTrDetailFields}
    account {
      _id
      code
      name
      currency
      kind
      journal
    }
  }
  shortDetail {
    ${commonTrDetailFields}
    account {
      _id
      code
      name
      currency
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
    _id
    number
    name
    percent
  }

  hasCtax
  ctaxRowId
  isHandleCtax
  ctaxAmount
  ctaxRow {
    _id
    number
    name
    percent
  }

  extraData

  permission
`;

const trsFilterParamDefs = `
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

const trRecsFilterParamDefs = `
  ${trsFilterParamDefs},
  $groupRule: [String],
  $folded: Boolean,
`;

const trsFilterParams = `
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

const trRecsFilterParams = `
  ${trsFilterParams}

  groupRule: $groupRule,
  folded: $folded,
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

export const TRANSACTIONS_QUERY = gql`
  query AccTransactions(${trsFilterParamDefs}, ${commonParamDefs}) {
    accTransactions(${trsFilterParams}, ${commonParams}) {
      ${commonTransactionFields}
      ptrInfo
    }
    accTransactionsCount(${trsFilterParams})
  }
`;

export const TR_RECORDS_QUERY = gql`
  query AccTrRecords(${trRecsFilterParamDefs}, ${commonParamDefs}) {
    accTrRecords(${trRecsFilterParams}, ${commonParams}) {
      ${commonTransactionFields}
    }
    accTrRecordsCount(${trRecsFilterParams})
  }
`;
