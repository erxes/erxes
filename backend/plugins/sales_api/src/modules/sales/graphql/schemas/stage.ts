export const types = `

  type SalesStage @key(fields: "_id") {
    _id: String!
    name: String!
    pipelineId: String!
    visibility: String
    code: String
    memberIds: [String]
    canMoveMemberIds: [String]
    canEditMemberIds: [String]
    members: [User]
    departmentIds: [String]
    probability: String
    status: String
    unUsedAmount: JSON
    amount: JSON
    itemsTotalCount: Int
    compareNextStage: JSON
    stayedDealsTotalCount: Int
    initialDealsTotalCount: Int
    inProcessDealsTotalCount: Int
    formId: String
    age: Int
    defaultTick: Boolean
    order: Int
    createdAt: Date
    type: String
  }
`;

const queryParams = `
  search: String,
  companyIds: [String]
  customerIds: [String]
  assignedUserIds: [String]
  labelIds: [String]
  extraParams: JSON,
  closeDateType: String,
  assignedToMe: String,
  age: Int,
  branchIds: [String]
  departmentIds: [String]
  segment: String
  segmentData:String
  createdStartDate: Date
  createdEndDate: Date
  stateChangedStartDate: Date
  stateChangedEndDate: Date
  startDateStartDate: Date
  startDateEndDate: Date
  closeDateStartDate: Date
  closeDateEndDate: Date
`;

export const queries = `
  salesStages(
    isNotLost: Boolean,
    isAll: Boolean,
    pipelineId: String,
    pipelineIds: [String],
    ${queryParams}
  ): [SalesStage]
  salesStageDetail(_id: String!, ${queryParams}): SalesStage
  salesArchivedStages(pipelineId: String!, search: String): [SalesStage]
  salesArchivedStagesCount(pipelineId: String!, search: String): Int
`;

export const mutations = `
  salesStagesUpdateOrder(orders: [SalesOrderItem]): [SalesStage]
  salesStagesRemove(_id: String!): JSON
  salesStagesEdit(_id: String!, name: String, status: String): SalesStage
  salesStagesSortItems(stageId: String!, processId: String, sortType: String): String
`;
