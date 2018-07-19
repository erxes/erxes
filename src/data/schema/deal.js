const commonTypes = `
  order: Int
  createdAt: Date
`;

export const types = `
  type DealBoard {
    _id: String!
    name: String!
    isDefault: Boolean
    ${commonTypes}
  }

  type DealPipeline {
    _id: String!
    name: String!
    boardId: String!
    ${commonTypes}
  }

  type DealStage {
    _id: String!
    name: String!
    probability: String
    pipelineId: String!
    amount: JSON
    ${commonTypes}
  }

  type Deal {
    _id: String!
    name: String!
    stageId: String!
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
    ${commonTypes}
  }
`;

export const queries = `
  dealBoards: [DealBoard]
  dealBoardGetDefault: DealBoard
  dealBoardDetail(_id: String!): DealBoard
  dealPipelines(boardId: String!): [DealPipeline]
  dealStages(pipelineId: String!): [DealStage]
  dealStageDetail(_id: String!): DealStage
  deals(stageId: String, customerId: String, companyId: String): [Deal]
  dealDetail(_id: String!): Deal
`;

const dealMutationParams = `
  name: String!,
  stageId: String!,
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
  dealBoardsRemove(_id: String!): String
  dealBoardsSetDefault(_id: String!): String

  dealPipelinesAdd(name: String!, boardId: String!, stages: JSON): DealPipeline
  dealPipelinesEdit(_id: String!, name: String!, boardId: String!, stages: JSON): DealPipeline
  dealPipelinesUpdateOrder(orders: [OrderItem]): [DealPipeline]
  dealPipelinesRemove(_id: String!): String

  dealStagesAdd(${dealStageMutationParams}): DealStage
  dealStagesEdit(_id: String!, ${dealStageMutationParams}): DealStage
  dealStagesChange(_id: String!, pipelineId: String!): DealStage
  dealStagesUpdateOrder(orders: [OrderItem]): [DealStage]
  dealStagesRemove(_id: String!): String

  dealsAdd(${dealMutationParams}): Deal
  dealsEdit(_id: String!, ${dealMutationParams}): Deal
  dealsChange( _id: String!, stageId: String!): Deal
  dealsUpdateOrder(orders: [OrderItem]): [Deal]
  dealsRemove(_id: String!): Deal
`;
