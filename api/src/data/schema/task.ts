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

export const queries = `
  taskDetail(_id: String!): Task
  tasks(${listQueryParams}): [TaskListItem]
  tasksTotalCount(${listQueryParams}): Int
  archivedTasks(pipelineId: String!, search: String, page: Int, perPage: Int): [Task]
  archivedTasksCount(pipelineId: String!, search: String): Int
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
