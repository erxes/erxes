import { GQL_CURSOR_PARAM_DEFS } from "erxes-api-shared/utils";

const trDetailFields = `
  _id: String
  accountId: String
  transactionId: String
  originId: String
  originType: String
  originSubId: String
  followInfos: JSON

  side: String
  amount: Float
  currencyAmount: Float
  customRate: Float
  assignedUserId: String

  productId: String
  count: Float
  unitPrice: Float

  excludeVat: Boolean
  excludeCtax: Boolean
`;

const transactionFields = `
  ptrId: String
  parentId: String
  number: String

  date: Date
  description: String
  journal: String
  originType: String
  followInfos: JSON

  branchId: String
  departmentId: String
  customerType: String
  customerId: String
  assignedUserIds: [String]

  hasVat: Boolean
  vatRowId: String
  afterVat: Boolean
  isHandleVat: Boolean
  vatAmount: Float

  hasCtax: Boolean
  ctaxRowId: String
  isHandleCtax: Boolean
  ctaxAmount: Float

  extraData: JSON
`;

export const types = () => `
  type AccTrDetail {
    ${trDetailFields}
    account: Account
  }

  type AccCommonTransaction {
    _id: String

    ${transactionFields}

    status: String
    ptrStatus: String

    createdAt: Date
    updatedAt: Date

    originId: String
    originSubId: String

    details: [AccTrDetail]
    shortDetail: AccTrDetail
    sumDt: Float
    sumCt: Float
    createdBy: String
    modifiedBy: String

    permission: String
    vatRow: VatRow
    ctaxRow: CtaxRow
    followTrs: [AccCommonTransaction]

    branch: Branch
    department: Department
    customer: AccCustomer

    ptrInfo: JSON
  }

  type AccCommonTrRecord {
    _id: String
    trId: String
    detailInd: Int

    ${transactionFields}

    status: String
    ptrStatus: String

    createdAt: Date
    updatedAt: Date

    originId: String
    originSubId: String

    details: AccTrDetail
    shortDetail: AccTrDetail
    sumDt: Float
    sumCt: Float
    createdBy: String
    modifiedBy: String

    permission: String
    vatRow: VatRow
    ctaxRow: CtaxRow
    followTrs: [AccCommonTransaction]

    branch: Branch
    department: Department
    customer: AccCustomer
  }

  type AccTransactionsListResponse {
    list: [AccCommonTransaction],
    pageInfo: PageInfo
    totalCount: Int,
  }

  type AccTrRecordsListResponse {
    list: [AccCommonTrRecord],
    pageInfo: PageInfo
    totalCount: Int,
  }

  input CommonTrDetailInput {
    ${trDetailFields}
  }

  input TransactionInput {
    _id: String
    ${transactionFields}

    details: [CommonTrDetailInput]
  }
`;

const trsQueryParams = `
  ids: [String],
  excludeIds: Boolean,
  status: String,
  searchValue: String,
  number: String,
  ptrStatus: String,

  accountIds: [String],
  accountKind: String,
  accountExcludeIds: Boolean,
  accountStatus: String,
  accountCategoryId: String,
  accountSearchValue: String,
  accountBrand: String,
  accountIsTemp: Boolean,
  accountIsOutBalance: Boolean,
  accountBranchId: String,
  accountDepartmentId: String,
  accountCurrency: String,
  accountJournal: String,

  brandId: String,
  isTemp: Boolean,
  isOutBalance: Boolean,
  branchId: String,
  departmentId: String,
  currency: String,
  journal: String,
  journals: [String],
  statuses: [String],

  createdUserId: String
  modifiedUserId: String
  startDate: Date
  endDate: Date
  startUpdatedDate: Date
  endUpdatedDate: Date
  startCreatedDate: Date
  endCreatedDate: Date
`;

const trRecsQueryParams = `
  ${trsQueryParams}

  groupRule: [String],
  folded: Boolean,
`;

export const queries = `
  accTransactionsMain(
    ${trsQueryParams},
    ${GQL_CURSOR_PARAM_DEFS}
  ): AccTransactionsListResponse
  accTransactions(
    ${trsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [AccCommonTransaction]
  accTransactionDetail(_id: String!): [AccCommonTransaction]
  accTransactionsCount(${trsQueryParams}): Int
  accTrRecordsMain(
    ${trRecsQueryParams},
    ${GQL_CURSOR_PARAM_DEFS}
  ): AccTrRecordsListResponse
  accTrRecords(
    ${trRecsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [AccCommonTrRecord]
  accTrRecordsCount(${trRecsQueryParams}): Int
  accOddTransactions: AccCommonTransaction
`;

export const mutations = `
  accTransactionsCreate(trDocs: [TransactionInput]): [AccCommonTransaction]
  accTransactionsUpdate(parentId: String, trDocs: [TransactionInput]): [AccCommonTransaction]
  accTransactionsRemove(parentId: String, ptrId: String): JSON

  accTransactionsLink(trIds: [String], ptrId: String): [AccCommonTransaction]
`;
