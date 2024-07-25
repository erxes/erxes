import {
  commonDragParams,
  commonListTypes,
  commonMutationParams,
  commonTypes,
  conformityQueryFields,
  copyParams
} from "./common";

export const types = ({ contacts, tags, clientPortal }) => `
  type TaskListItem {
    customPropertiesData:JSON,
    ${commonListTypes}
  }

  type Task @key(fields: "_id") {
    _id: String!
    source: String
    ${
      contacts
        ? `
      companies: [Company]
      customers: [Customer]
      `
        : ""
    }

    ${tags ? `tags: [Tag]` : ""}
    ${clientPortal ? `vendorCustomers: [ClientPortalUser]` : ""}

    ${commonTypes}
  }
`;

const listQueryParams = `
  _ids: [String]
  pipelineId: String
  pipelineIds: [String]
  page: Int
  perPage: Int
  parentId:String
  stageId: String
  customerIds: [String]
  vendorCustomerIds: [String]
  companyIds: [String]
  date: TasksItemDate
  skip: Int
  limit: Int
  search: String
  assignedUserIds: [String]
  closeDateType: String
  priority: [String]
  source: [String]
  labelIds: [String]
  sortField: String
  sortDirection: Int
  userIds: [String]
  segment: String
  segmentData: String
  assignedToMe: String
  startDate: String
  endDate: String
  hasStartAndCloseDate: Boolean
  tagIds: [String]
  noSkipArchive: Boolean
  number: String
  branchIds: [String]
  departmentIds: [String]
  boardIds: [String]
  stageCodes: [String]
  dateRangeFilters:JSON
  customFieldsDataFilters:JSON
  createdStartDate: Date,
  createdEndDate: Date
  stateChangedStartDate: Date
  stateChangedEndDate: Date
  startDateStartDate: Date
  startDateEndDate: Date
  closeDateStartDate: Date
  closeDateEndDate: Date
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
  sources: [String]
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

const taskMutationParams = `
  source: String,
`;

export const mutations = `
  tasksAdd(name: String!, ${copyParams}, ${taskMutationParams}, ${commonMutationParams}): Task
  tasksEdit(_id: String!, name: String, ${taskMutationParams}, ${commonMutationParams}): Task
  tasksChange(${commonDragParams}): Task
  tasksRemove(_id: String!): Task
  tasksWatch(_id: String, isAdd: Boolean): Task
  tasksCopy(_id: String!, proccessId: String): Task
  tasksArchive(stageId: String!, proccessId: String): String
`;
