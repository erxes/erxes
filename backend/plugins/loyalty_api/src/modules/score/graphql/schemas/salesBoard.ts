export const types = `
  type LoyaltySalesBoard {
    _id: String
    name: String
    pipelines: [LoyaltySalesPipeline]
  }

  type LoyaltySalesPipeline {
    _id: String
    name: String
    boardId: String
  }

  type LoyaltySalesStage {
    _id: String
    name: String
    order: Int
    pipelineId: String
  }
`;

export const queries = `
  loyaltySalesBoards: [LoyaltySalesBoard]
  loyaltySalesPipelines(boardId: String): [LoyaltySalesPipeline]
  loyaltySalesStages(pipelineId: String!): [LoyaltySalesStage]
`;
