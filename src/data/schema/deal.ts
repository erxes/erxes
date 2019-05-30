const commonTypes = `
  order: Int
  createdAt: Date
`;

export const types = `
  type DealBoard {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [DealPipeline]
  }

  type DealPipeline {
    _id: String!
    name: String!
    boardId: String!
    visiblity: String!
    memberIds: [String]
    ${commonTypes}
  }

  type DealStage {
    _id: String!
    name: String!
    probability: String
    pipelineId: String!
    amount: JSON
    deals: [Deal]
    dealsTotalCount: Int
    ${commonTypes}
  }

  type Deal {
    _id: String!
    name: String!
    stageId: String
    pipeline: DealPipeline
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
    stage: DealStage
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

  input DealDate {
    month: Int
    year: Int
  }
`;

export const queries = `
  dealBoards: [DealBoard]
  dealBoardGetLast: DealBoard
  dealBoardDetail(_id: String!): DealBoard
  dealPipelines(boardId: String!): [DealPipeline]
  dealPipelineDetail(_id: String!): DealPipeline
  dealStages(
    pipelineId: String!, 
    search: String
    companyIds: [String]
    customerIds: [String]
    assignedUserIds: [String]
    productIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
  ): [DealStage]
  dealStageDetail(_id: String!): DealStage
  dealDetail(_id: String!): Deal
  deals(
    pipelineId: String,
    stageId: String, 
    date: DealDate,
    skip: Int
    search: String,
    customerIds: [String]
    companyIds: [String]
    assignedUserIds: [String]
    productIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
  ): [Deal]
  dealsTotalAmounts(
    date: DealDate 
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

const dealMutationParams = `
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

const dealStageMutationParams = `
  name: String!,
  probability: String,
  pipelineId: String!
`;

export const mutations = `
  dealBoardsAdd(name: String!): DealBoard
  dealBoardsEdit(_id: String!, name: String!): DealBoard
  dealBoardsRemove(_id: String!): JSON

  dealPipelinesAdd(name: String!, boardId: String!, stages: JSON, visiblity: String!, memberIds: [String]): DealPipeline
  dealPipelinesEdit(_id: String!, name: String!, boardId: String!, stages: JSON, visiblity: String!, memberIds: [String]): DealPipeline
  dealPipelinesUpdateOrder(orders: [OrderItem]): [DealPipeline]
  dealPipelinesRemove(_id: String!): JSON

  dealStagesAdd(${dealStageMutationParams}): DealStage
  dealStagesEdit(_id: String!, ${dealStageMutationParams}): DealStage
  dealStagesChange(_id: String!, pipelineId: String!): DealStage
  dealStagesUpdateOrder(orders: [OrderItem]): [DealStage]
  dealStagesRemove(_id: String!): JSON

  dealsAdd(${dealMutationParams}): Deal
  dealsEdit(_id: String!, ${dealMutationParams}): Deal
  dealsChange( _id: String!, destinationStageId: String): Deal
  dealsUpdateOrder(stageId: String!, orders: [OrderItem]): [Deal]
  dealsRemove(_id: String!): Deal
`;
