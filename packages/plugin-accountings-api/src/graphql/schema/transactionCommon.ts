export const types = () => `
  type FollowTrType {
    type: String
    id: String
  }

  type TrDetail @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    accountId: String
    transactionId: String
    originId: String
    follows: [FollowTrType]
  
    side: String
    amount: Float
    currency: String
    currencyAmount: Float
    customRate: Float
    assignedUserId: String
  
    productId: String
    count: Float
    unitPrice: Float
  }

  type CommonTransaction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    ptrId: String
    parentId: String
    number: String
    ptrStatus: String
    createdAt: Date
    modifiedAt: Date

    date: Date
    description: String
    status: String
    journal: String
    originId: String
    follows: [FollowTrType]

    branchId: String
    departmentId: String
    customerType: String
    customerId: String
    assignedUserIds: [String]

    details: [TrDetail]
    shortDetail: TrDetail
    sumDt: Float
    sumCt: Float
    createdBy: String
    modifiedBy: String

    permission: String
    followTrs: [CommonTransaction]
  }
`;

const mainTrParams = `
  ptrId: String
  parentId: String
  number: String
  date: Date
  description: String
  journal: String

  branchId: String
  departmentId: String
  customerType: String
  customerId: String
  assignedUserIds: [String]

  accountId: String
  side: String
  amount: Float
`;

const currencyParams = `
  currencyAmount: Float
  customRate: Float
  currencyDiffAccountId: String
`;

const taxParams = `
  hasVat: Boolean,
  vatRowId: String,
  afterVat: Boolean,
  afterVatAccountId: String,
  isHandleVat: Boolean,
  vatAmount: Float,

  hasCtax: Boolean,
  ctaxRowId: String,
  isHandleCtax: Boolean,
  ctaxAmount: Float,
`;


const trsQueryParams = `
  ids: [String],
  excludeIds: Boolean,
  status: String,
  searchValue: String,
  number: String,

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
  transactions(
    ${trsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [CommonTransaction]
  transactionDetail(_id: String!): CommonTransaction
  transactionsCount(${trsQueryParams}): Int
  ptrs(
    ${trsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): CommonTransaction
  oddTransactions: CommonTransaction
`;

export const mutations = `
  mainTrAdd(${mainTrParams}): [CommonTransaction]
  mainTrEdit(_id: String!, ${mainTrParams}): [CommonTransaction]
  mainTrRemove(_id: String!): String

  ptrRemove(_id: String!): String

  transactionsLink(trIds: [String], ptrId: String): [CommonTransaction]

  cashTrAdd(${mainTrParams}, ${currencyParams}, ${taxParams}): [CommonTransaction]
  cashTrEdit(_id: String!, ${mainTrParams}, ${currencyParams}, ${taxParams}): [CommonTransaction]
  fundTrAdd(${mainTrParams}, ${currencyParams}, ${taxParams}): [CommonTransaction]
  fundTrEdit(_id: String!, ${mainTrParams}, ${currencyParams}, ${taxParams}): [CommonTransaction]
  debtTrAdd(${mainTrParams}, ${currencyParams}, ${taxParams}): [CommonTransaction]
  debtTrEdit(_id: String!, ${mainTrParams}, ${currencyParams}, ${taxParams}): [CommonTransaction]
`;
