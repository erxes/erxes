export const types = `
  type SavingBlock {
    _id: String!
    number: String
    blockType: String
    contractId: String
    customerId: String
    companyId: String
    description: String
    payDate: Date
    amount: Float
    didAmount: Float
    status: String
    currency: String
    scheduleDate: Date
    contractReaction: JSON
  }

  type SavingBlockListResponse {
    list: [SavingBlock],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  sortField: String
  sortDirection: Int
`;

export const queries = `
  savingsBlocks(${queryParams}): [SavingBlock]  
`;

const commonFields = `
  number: String,
  blockType: String,
  contractId: String,
  customerId: String,
  companyId: String,
  description: String,
  payDate: Date,
  amount: Float,
  didAmount: Float,
  status: String,
  currency: String,
  scheduleDate: Date
`;

export const mutations = `
  savingsBlockAdd(${commonFields}): SavingBlock
  savingsBlocksRemove(contractIds: [String]): [String]
`;
