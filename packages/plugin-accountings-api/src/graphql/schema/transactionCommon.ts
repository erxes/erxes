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
    modifiedAt: Date

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

const mainTrParams = `
  ${transactionFields}

  details: CommonTrDetailInput
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
  accountIsOutBalance: Boolean,
  accountBranchId: String,
  accountDepartmentId: String,
  accountCurrency: String,
  accountJournal: String,

  brandId: String,
  isOutBalance: Boolean,
  branchId: String,
  departmentId: String,
  currency: String,
  journal: String,
  statuses: [String],
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
  accPtrs(
    ${trsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): AccCommonTransaction
  accOddTransactions: AccCommonTransaction
`;

export const mutations = `
  accTransactionsCreate(trDocs: [TransactionInput]): [AccCommonTransaction]
  accTransactionsUpdate(parentId: String, trDocs: [TransactionInput]): [AccCommonTransaction]
  accMainTrAdd(${mainTrParams}): [AccCommonTransaction]
  accMainTrEdit(_id: String!, ${mainTrParams}): [AccCommonTransaction]
  accMainTrRemove(_id: String!): String

  accPtrRemove(_id: String!): String

  accTransactionsLink(trIds: [String], ptrId: String): [AccCommonTransaction]

  accCashTrAdd(${mainTrParams}): [AccCommonTransaction]
  accCashTrEdit(_id: String!, ${mainTrParams}): [AccCommonTransaction]
  accFundTrAdd(${mainTrParams}): [AccCommonTransaction]
  accFundTrEdit(_id: String!, ${mainTrParams}): [AccCommonTransaction]
  accDebtTrAdd(${mainTrParams}): [AccCommonTransaction]
  accDebtTrEdit(_id: String!, ${mainTrParams}): [AccCommonTransaction]
`;
