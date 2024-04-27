export const types = () => `
  type FollowTrType @key(fields: "_id") @cacheControl(maxAge: 3) {
    type: String
    id: String
  }

  type TrDetail @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    accountId: String
    transactionId: String
    originId: String
    follows: [FollowTrType];
  
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

  type MainTransaction @key(fields: "_id") @cacheControl(maxAge: 3) {
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
    ptrStatus: String
    originId: String
    follows: [FollowTrType];

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

    followTrs: [MainTransaction]
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
  currencyAmount: Float
  customRate: Float
`;


const trsQueryParams = `
  accountIds: [String]
  status: String,
  searchValue: String,
  brand: String
  ids: [String],
  excludeIds: Boolean,
  isOutBalance: Boolean,
  branchId: String
  departmentId: String
  currency: String
`;

export const queries = `
  mainTransactions(
    ${trsQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int    
  ): [MainTransaction]
  mainTrTotalCount(${trsQueryParams}): Int
  accountDetail(_id: String): Account
  oddTransactions(): MainTransaction
`;

export const mutations = `
  mainTrAdd(${mainTrParams}): [MainTransaction]
  mainTrEdit(_id: String!, ${mainTrParams}): [MainTransaction]
  mainTrRemove(): String

  ptrRemove(): String

  transactionLink(trIds: [String])

`;
