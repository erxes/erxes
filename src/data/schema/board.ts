const commonTypes = `
  order: Int
  createdAt: Date
  type: String
`;

export const types = `
  type Board {
    _id: String!
    name: String!
    ${commonTypes}
    pipelines: [Pipeline]
  }

  type Pipeline {
    _id: String!
    name: String!
    boardId: String!
    visibility: String!
    memberIds: [String]
    ${commonTypes}
  }

  type Stage {
    _id: String!
    name: String!
    probability: String
    pipelineId: String!
    amount: JSON
    itemsTotalCount: Int
    ${commonTypes}
  }

  input ItemDate {
    month: Int
    year: Int
  }
`;

export const queries = `
  boards(type: String!): [Board]
  boardGetLast(type: String!): Board
  boardDetail(_id: String!): Board
  pipelines(boardId: String!): [Pipeline]
  pipelineDetail(_id: String!): Pipeline
  stages(
    pipelineId: String!,
    search: String,
    companyIds: [String],
    customerIds: [String],
    assignedUserIds: [String],
    productIds: [String],
    nextDay: String,
    nextWeek: String,
    nextMonth: String,
    noCloseDate: String,
    overdue: String,
  ): [Stage]
  stageDetail(_id: String!): Stage
`;

const commonParams = `
  name: String!,
  type: String!
`;

const pipelineParams = `
  name: String!,
  boardId: String!,
  type: String!,
  stages: JSON,
  visibility: String!,
  memberIds: [String]
`;

export const mutations = `
  boardsAdd(${commonParams}): Board
  boardsEdit(_id: String!, ${commonParams}): Board
  boardsRemove(_id: String!): JSON

  pipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  pipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  pipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  pipelinesRemove(_id: String!): JSON

  stagesUpdateOrder(orders: [OrderItem]): [Stage]
  stagesRemove(_id: String!): JSON
`;
