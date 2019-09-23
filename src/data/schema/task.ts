import { commonTypes, conformityQueryFields } from './common';

export const types = `
  type Task {
    _id: String!
    boardId: String
    priority: String
    companies: [Company]
    customers: [Customer]
    assignedUsers: [User]
    isWatched: Boolean
    attachments: [Attachment]
    stage: Stage
    pipeline: Pipeline
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
    priority: [String]
    ${conformityQueryFields}
  ): [Task]
`;

const commonParams = `
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  closeDate: Date,
  description: String,
  order: Int,
  priority: String,
  reminderMinute: Int,
  isComplete: Boolean
`;

export const mutations = `
  tasksAdd(name: String!, ${commonParams}): Task
  tasksEdit(_id: String!, name: String, ${commonParams}): Task
  tasksChange( _id: String!, destinationStageId: String): Task
  tasksUpdateOrder(stageId: String!, orders: [OrderItem]): [Task]
  tasksRemove(_id: String!): Task
  tasksWatch(_id: String, isAdd: Boolean): Task
`;
