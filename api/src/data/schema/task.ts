import {
  commonDragParams,
  commonListTypes,
  commonMutationParams,
  commonTypes,
  conformityQueryFields,
  copyParams
} from './common';

export const types = `
  type TaskListItem {
    ${commonListTypes}
  }
    
  type Task {
    _id: String!
    companies: [Company]
    customers: [Customer]
    ${commonTypes}
  }
`;

const listQueryParams = `
    pipelineId: String
    stageId: String
    customerIds: [String]
    companyIds: [String]
    date: ItemDate
    skip: Int
    limit: Int
    search: String
    assignedUserIds: [String]
    closeDateType: String
    priority: [String]
    labelIds: [String]
    sortField: String
    sortDirection: Int
    userIds: [String]
    segment: String
    assignedToMe: String
    startDate: String
    endDate: String
    ${conformityQueryFields}
`;

const archivedTasksParams = `
  pipelineId: String! 
  search: String 
  userIds: [String]
  priorities: [String]
  assignedUserIds: [String]
  labelIds: [String]
  companyIds: [String]
  customerIds: [String]
  startDate: String
  endDate: String 
`;

export const queries = `
  taskDetail(_id: String!): Task
  tasks(${listQueryParams}): [TaskListItem]
  tasksTotalCount(${listQueryParams}): Int
  archivedTasks(
    page: Int
    perPage: Int
    ${archivedTasksParams}
  ): [Task]
  archivedTasksCount(
    ${archivedTasksParams}
  ): Int
`;

export const mutations = `
  tasksAdd(name: String!, ${copyParams}, ${commonMutationParams}): Task
  tasksEdit(_id: String!, name: String, ${commonMutationParams}): Task
  tasksChange(${commonDragParams}): Task
  tasksRemove(_id: String!): Task
  tasksWatch(_id: String, isAdd: Boolean): Task
  tasksCopy(_id: String!, proccessId: String): Task
  tasksArchive(stageId: String!, proccessId: String): String
`;
