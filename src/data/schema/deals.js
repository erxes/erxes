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
    ${commonTypes}
  }

  type Deal {
    _id: String!
    boardId: String
    pipelineId: String
    stageId: String!
    productIds: [String]!
    companyId: String!
    amount: Int
    closeDate: Date
    note: String
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

export const mutations = `
	dealBoardsAdd(name: String!): DealBoard
	dealBoardsEdit(_id: String!, name: String!): DealBoard
  dealBoardsRemove(ids: [String!]!): String

	dealPipelinesAdd(name: String!, boardId: String!): DealPipeline
	dealPipelinesEdit(_id: String!, name: String!, boardId: String!): DealPipeline
  dealPipelinesRemove(ids: [String!]!): String

	dealStagesAdd(name: String!, boardId: String, pipelineId: String!): DealStage
	dealStagesEdit(
    _id: String!, name: String!, boardId: String, pipelineId: String!
  ): DealStage
  dealStagesRemove(ids: [String!]!): String

	dealsAdd(
    boardId: String,
    pipelineId: String,
    stageId: String!,
    productIds: [String]!,
    companyId: String!,
    amount: Int!,
    closeDate: Date!,
    note: String,
  ): Deal
	dealsEdit(
    _id: String!,
    boardId: String,
    pipelineId: String,
    stageId: String!,
    productIds: [String]!,
    companyId: String!,
    amount: Int!,
    closeDate: Date!,
    note: String,
  ): Deal
  dealsRemove(ids: [String!]!): String
`;
