import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS, GQL_PAGE_INFO } from 'erxes-ui';

export const commonTrDetailFields = `
  _id
  accountId
  transactionId
  originId
  originType
  originSubId
  followInfos

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
  originType
  originSubId
  followInfos

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
  $accountKind: String,
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
  $journals: [String],
  $statuses: [String],

  $createdUserId: String,
  $modifiedUserId: String,
  $startDate: Date,
  $endDate: Date,
  $startUpdatedDate: Date,
  $endUpdatedDate: Date,
  $startCreatedDate: Date,
  $endCreatedDate: Date,
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
  accountKind: $accountKind,
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
  journals: $journals
  statuses: $statuses,

  createdUserId: $createdUserId,
  modifiedUserId: $modifiedUserId,
  startDate: $startDate,
  endDate: $endDate,
  startUpdatedDate: $startUpdatedDate,
  endUpdatedDate: $endUpdatedDate,
  startCreatedDate: $startCreatedDate,
  endCreatedDate: $endCreatedDate,
`;

const trRecsFilterParams = `
  ${trsFilterParams}

  groupRule: $groupRule,
  folded: $folded,
`;

export const TRANSACTIONS_QUERY = gql`
  query AccTransactions(${trsFilterParamDefs}, ${GQL_CURSOR_PARAM_DEFS}) {
    accTransactionsMain(${trsFilterParams}, ${GQL_CURSOR_PARAMS}) {
      list {
        ${commonTransactionFields}
        ptrInfo
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;

export const TR_RECORDS_QUERY = gql`
  query AccTrRecords(${trRecsFilterParamDefs}, ${GQL_CURSOR_PARAM_DEFS}) {
    accTrRecordsMain(${trRecsFilterParams}, ${GQL_CURSOR_PARAMS}) {
      list {
        ${commonTransactionFields}
      }
      totalCount
      ${GQL_PAGE_INFO}
    }
  }
`;
