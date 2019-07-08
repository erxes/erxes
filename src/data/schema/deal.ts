const commonTypes = `
  order: Int
  createdAt: Date
`;

export const types = `
  type Deal {
    _id: String!
    name: String!
    stageId: String
    pipeline: Pipeline
    boardId: String
    companyIds: [String]
    customerIds: [String]
    assignedUserIds: [String]
    amount: JSON
    closeDate: Date
    description: String
    companies: [Company]
    customers: [Customer]
    products: JSON
    productsData: JSON
    assignedUsers: [User]
    modifiedAt: Date
    modifiedBy: String
    stage: Stage
    ${commonTypes}
  }

  type DealTotalAmount {
    _id: String
    currency: String
    amount: Float
  }

  type DealTotalAmounts {
    _id: String
    dealCount: Int
    dealAmounts: [DealTotalAmount]
  }
`;

export const queries = `
  dealDetail(_id: String!): Deal
  deals(
    initialStageId: String
    pipelineId: String
    stageId: String
    customerIds: [String]
    companyIds: [String]
    date: ItemDate
    skip: Int
    search: String
    assignedUserIds: [String]
    productIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
  ): [Deal]
  dealsTotalAmounts(
    date: ItemDate 
    pipelineId: String 
    customerIds: [String]
    companyIds: [String]
    assignedUserIds: [String]
    productIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
  ): DealTotalAmounts
`;

const commonParams = `
  name: String!,
  stageId: String,
  assignedUserIds: [String],
  companyIds: [String],
  customerIds: [String],
  closeDate: Date,
  description: String,
  order: Int,
  productsData: JSON
`;

export const mutations = `
  dealsAdd(${commonParams}): Deal
  dealsEdit(_id: String!, ${commonParams}): Deal
  dealsChange( _id: String!, destinationStageId: String): Deal
  dealsUpdateOrder(stageId: String!, orders: [OrderItem]): [Deal]
  dealsRemove(_id: String!): Deal
`;
