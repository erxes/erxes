const ruleFields = `
  _id : String!,
  kind: String!,
  text: String!,
  condition: String!,
  value: String,
`;

export const types = `
  type Rule {
    ${ruleFields}
  }

  input InputRule {
    ${ruleFields}
  }

  type TimeTrack {
    status: String,
    timeSpent: Int,
    startDate: String
  }
`;

export const conformityQueryFields = `
  conformityMainType: String
  conformityMainTypeId: String
  conformityIsRelated: Boolean
  conformityIsSaved: Boolean
`;

export const commonTypes = `
  name: String!
  order: Float
  createdAt: Date
  hasNotified: Boolean
  assignedUserIds: [String]
  labelIds: [String]
  startDate: Date
  closeDate: Date
  description: String
  modifiedAt: Date
  modifiedBy: String
  reminderMinute: Int,
  isComplete: Boolean,
  isWatched: Boolean,
  stageId: String
  boardId: String
  priority: String
  status: String
  attachments: [Attachment]
  userId: String

  assignedUsers: JSON
  stage: Stage
  labels: [PipelineLabel]
  pipeline: Pipeline
  createdUser: User
  customFieldsData: JSON
  score: Float
  timeTrack: TimeTrack
`;

export const commonMutationParams = `
  proccessId: String,
  aboveItemId: String,
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  startDate: Date,
  closeDate: Date,
  description: String,
  order: Int,
  reminderMinute: Int,
  isComplete: Boolean,
  priority: String,
  status: String,
  sourceConversationIds: [String],
  customFieldsData: JSON
`;

export const commonDragParams = `
  itemId: String!,
  aboveItemId: String,
  destinationStageId: String!,
  sourceStageId: String,
  proccessId: String
`;

export const copyParams = `companyIds: [String], customerIds: [String], labelIds: [String]`;

export const commonListTypes = `
  _id: String!
  name: String
  companies: JSON
  customers: JSON
  assignedUsers: JSON
  stage: JSON
  labels: JSON
  isComplete: Boolean
  isWatched: Boolean
  relations: JSON
  startDate: Date
  closeDate: Date
  modifiedAt: Date
  priority: String
  hasNotified: Boolean
  score: Float
`;
