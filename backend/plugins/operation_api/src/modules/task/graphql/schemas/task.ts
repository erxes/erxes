import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type Task {
    _id: String
    name: String
    description: String
    status: String
    priority: Int
    labelIds: [String]
    tagIds: [String]
    assigneeId: String
    createdBy: String
    startDate: Date
    targetDate: Date
    createdAt: Date
    updatedAt: Date
    cycleId: String
    projectId: String
    teamId: String
    estimatePoint: Int
    statusChangedDate: Date
    number: Int
  }

  type TaskListResponse {
    list: [Task],
    pageInfo: PageInfo
    totalCount: Int,
  }

  input ITaskFilter {
    _id: String
    status: String
    priority: Int
    assigneeId: String
    createdBy: String
    cycleId: String
    labelIds: [String]
    tagIds: [String]
    startDate: Date
    targetDate: Date
    projectId: String 
    teamId: String
    estimatePoint: Int
    userId: String
    name:String
    statusType: Int
    estimate: String

    ${GQL_CURSOR_PARAM_DEFS}
  }

  type TaskSubscription {
    type: String
    task: Task
  }
`;

const createTaskParams = `
  name: String!
  description: String
  teamId: String!
  status: String
  priority: Int
  labelIds: [String]
  tagIds: [String]
  startDate: Date
  targetDate: Date
  assigneeId: String
  cycleId: String
  projectId: String
  estimatePoint: Int
`;

const updateTaskParams = `
  _id: String!
  name: String
  description: String
  teamId: String
  status: String
  priority: Int
  labelIds: [String]
  tagIds: [String]
  assigneeId: String
  startDate: Date
  targetDate: Date
  cycleId: String
  projectId: String
  estimatePoint: Int

`;

export const queries = `
  getTask(_id: String!): Task
  getTasks(filter: ITaskFilter): TaskListResponse
`;

export const mutations = `
  createTask(${createTaskParams}): Task
  updateTask(${updateTaskParams}): Task
  removeTask(_id: String!): Task
  convertToProject(_id: String!): Project
`;
