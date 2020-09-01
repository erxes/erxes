import { commonDragParams, commonMutationParams, commonTypes, conformityQueryFields, copyParams } from './common';

export const types = `
  type Task {
    _id: String!
    companies: [Company]
    customers: [Customer]
    timeTrack: TimeTrack
    ${commonTypes}
  }

  type TimeTrack {
    status: String,
    timeSpent: Int,
    startDate: String
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
    closeDateType: String
    priority: [String]
    labelIds: [String]
    sortField: String
    sortDirection: Int
    userIds: [String]
    ${conformityQueryFields}
  ): [Task]
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
  taskUpdateTimeTracking(_id: String!, status: String!, timeSpent: Int!, startDate: String): JSON
`;
