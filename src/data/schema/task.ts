import { commonTypes, conformityQueryFields } from './common';

export const types = `
  type Task {
    _id: String!
    companies: [Company]
    customers: [Customer]
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
    closeDateType: String
    priority: [String]
    labelIds: [String]
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
  tasksAdd(name: String!, customerIds: [String], companyIds: [String], ${commonParams}): Task
  tasksEdit(_id: String!, name: String, ${commonParams}): Task
  tasksChange( _id: String!, destinationStageId: String): Task
  tasksUpdateOrder(stageId: String!, orders: [OrderItem]): [Task]
  tasksRemove(_id: String!): Task
  tasksWatch(_id: String, isAdd: Boolean): Task
`;
