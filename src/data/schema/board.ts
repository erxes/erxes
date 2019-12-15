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
    members: [User]
    bgColor: String
    isWatched: Boolean
    itemsTotalCount: Int

    startDate: Date
    endDate: Date
    metric: String
    hackScoringType: String
    templateId: String
    state: String
    isCheckUser: Boolean
    excludeCheckUserIds: [String]
    ${commonTypes}
  }

  type Stage {
    _id: String!
    name: String!
    pipelineId: String!
    probability: String
    amount: JSON
    itemsTotalCount: Int
    compareNextStage: JSON
    stayedDealsTotalCount: Int
    initialDealsTotalCount: Int
    inProcessDealsTotalCount: Int
    formId: String
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
    isNotLost: Boolean,
    pipelineId: String!,
    search: String,
    companyIds: [String]
    customerIds: [String]
    assignedUserIds: [String]
    extraParams: JSON,
    closeDateType: String,
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
  memberIds: [String],
  bgColor: String,
  startDate: Date,
  endDate: Date,
  metric: String,
  hackScoringType: String,
  templateId: String,
  isCheckUser: Boolean
  excludeCheckUserIds: [String],
`;

export const mutations = `
  boardsAdd(${commonParams}): Board
  boardsEdit(_id: String!, ${commonParams}): Board
  boardsRemove(_id: String!): JSON

  pipelinesAdd(${commonParams}, ${pipelineParams}): Pipeline
  pipelinesEdit(_id: String!, ${commonParams}, ${pipelineParams}): Pipeline
  pipelinesUpdateOrder(orders: [OrderItem]): [Pipeline]
  pipelinesWatch(_id: String!, isAdd: Boolean, type: String!): Pipeline
  pipelinesRemove(_id: String!): JSON

  stagesUpdateOrder(orders: [OrderItem]): [Stage]
  stagesRemove(_id: String!): JSON
`;
