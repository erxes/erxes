const trDetailFields = `
  _id: String
  accountId: String
  transactionId: String
  originId: String
  followInfos: JSON

  side: String
  amount: Float
  currencyAmount: Float
  customRate: Float
  assignedUserId: String

  productId: String
  count: Float
  unitPrice: Float
`;

const transactionFields = `
  ptrId: String
  parentId: String
  number: String

  date: Date
  description: String
  journal: String
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

  data: JSON
`;

export const types = () => `
  type FollowTrType {
    type: String
    id: String
  }

  type AccTrDetail @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${trDetailFields}
    follows: [FollowTrType]
    account: Account
  }

  type AccCommonTransaction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String

    ${transactionFields}

    status: String
    ptrStatus: String

    createdAt: Date
    updatedAt: Date

    originId: String
    follows: [FollowTrType]

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

    extraData: JSON
  }

  type AccCommonTrRecord @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    trId: String
    detailInd: Int

    ${transactionFields}

    status: String
    ptrStatus: String

    createdAt: Date
    updatedAt: Date

    originId: String
    follows: [FollowTrType]

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

    extraData: JSON
  }

  input CommonTrDetailInput {
    ${trDetailFields}
  }
  type CommonTrDetailInputs {
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
  accountType: String,
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
  statuses: [String],
`;

const trRecsQueryParams = `
  ${trsQueryParams}

  groupRule: [String],
  folded: Boolean,
`;

export const queries = `
  accTransactions(
    ${trsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [AccCommonTransaction]
  accTransactionDetail(_id: String!): [AccCommonTransaction]
  accTransactionsCount(${trsQueryParams}): Int
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
