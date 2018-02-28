const commonTypes = `
  order: Int
  createdAt: Date
`;

export const types = `
  type DealBoard {
    _id: String!
    name: String!
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
    boardId: String
    pipelineId: String!
    amount: JSON
    ${commonTypes}
  }

  type Deal {
    _id: String!
    boardId: String
    pipelineId: String
    stageId: String!
    productIds: [String]!
    productsData: JSON!
    companyId: String!
    customerId: String!
    amount: JSON
    closeDate: Date
    note: String
    company: Company
    customer: Customer
    products: [Product]
    assignedUsers: [User]
    ${commonTypes}
  }
`;

export const queries = `
  dealBoards: [DealBoard]
  dealBoardGetLast: DealBoard
  dealBoardDetail(_id: String!): DealBoard
  dealPipelines(boardId: String!): [DealPipeline]
  dealStages(boardId: String, pipelineId: String!): [DealStage]
  deals(boardId: String, pipelineId: String, stageId: String!): [Deal]
`;

const dealMutationParams = `
  boardId: String,
  pipelineId: String,
  stageId: String!,
  productIds: [String]!,
  assignedUserIds: [String],
  companyId: String!,
  customerId: String!,
  closeDate: Date!,
  note: String,
  order: Int,
  productsData: JSON
`;

export const mutations = `
	dealBoardsAdd(name: String!): DealBoard
	dealBoardsEdit(_id: String!, name: String!): DealBoard
  dealBoardsRemove(_id: String!): String

	dealPipelinesAdd(name: String!, boardId: String!, stages: JSON): DealPipeline
	dealPipelinesEdit(_id: String!, name: String!, boardId: String!,
    stages: JSON): DealPipeline
  dealPipelinesUpdateOrder(orders: [OrderItem]): [DealPipeline]
  dealPipelinesRemove(_id: String!): String

	dealStagesAdd(name: String!, boardId: String, pipelineId: String!): DealStage
	dealStagesEdit(
    _id: String!, name: String!, boardId: String, pipelineId: String!
  ): DealStage
	dealStagesChange(_id: String!, pipelineId: String!): DealStage
  dealStagesUpdateOrder(orders: [OrderItem]): [DealStage]
  dealStagesRemove(_id: String!): String

	dealsAdd(${dealMutationParams}): Deal
	dealsEdit(_id: String!, ${dealMutationParams}): Deal
	dealsChange( _id: String!, pipelineId: String, stageId: String! ): Deal
  dealsUpdateOrder(orders: [OrderItem]): [Deal]
  dealsRemove(_id: String!): String
`;
