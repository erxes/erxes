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

  assignedUsers: [User]
  stage: Stage
  labels: [PipelineLabel]
  pipeline: Pipeline
  createdUser: User
`;

export const commonMutationParams = `
  proccessId: String,
  aboveItemId: String,
  stageId: String,
  assignedUserIds: [String],
  attachments: [AttachmentInput],
  closeDate: Date,
  description: String,
  order: Int,
  reminderMinute: Int,
  isComplete: Boolean,
  priority: String,
  status: String,
  sourceConversationIds: [String],
`;

export const commonDragParams = `
  itemId: String!,
  aboveItemId: String,
  destinationStageId: String!,
  sourceStageId: String,
  proccessId: String
`;

export const copyParams = `companyIds: [String], customerIds: [String], labelIds: [String]`;
