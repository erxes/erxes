const commonTypes = `
  order: Int
  createdAt: Date
`;

export const types = `
  type Task {
    _id: String!
    name: String!
    stageId: String
    boardId: String
    companyIds: [String]
    customerIds: [String]
    assignedUserIds: [String]
    closeDate: Date
    description: String
    priority: String
    companies: [Company]
    customers: [Customer]
    assignedUsers: [User]
    stage: Stage
    pipeline: Pipeline
    modifiedAt: Date
    modifiedBy: String
    ${commonTypes}
  }
`;

export const queries = `
  taskDetail(_id: String!): Task
  tasks(
    pipelineId: String
    stageId: String
    customerIds: [String]
    companyIds: [String]
    date: ItemDate
    skip: Int
    search: String
    assignedUserIds: [String]
    nextDay: String
    nextWeek: String
    nextMonth: String
    noCloseDate: String
    overdue: String
  ): [Task]
`;

const commonParams = `
  name: String!,
  stageId: String,
  assignedUserIds: [String],
  companyIds: [String],
  customerIds: [String],
  closeDate: Date,
  description: String,
  priority: String,
  order: Int,
`;

export const mutations = `
  tasksAdd(${commonParams}): Task
  tasksEdit(_id: String!, ${commonParams}): Task
  tasksChange( _id: String!, destinationStageId: String): Task
  tasksUpdateOrder(stageId: String!, orders: [OrderItem]): [Task]
  tasksRemove(_id: String!): Task
`;
