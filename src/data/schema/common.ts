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
  order: Int
  createdAt: Date
  hasNotified: Boolean
  assignedUserIds: [String]
  assignedUsers: [User]
  labelIds: [String]
  labels: [PipelineLabel]
  closeDate: Date
  description: String
  modifiedAt: Date
  modifiedBy: String
  reminderMinute: Int,
  isComplete: Boolean,
  isWatched: Boolean,
  stageId: String
  stage: Stage
  pipeline: Pipeline
  boardId: String
  priority: String
  status: String
  attachments: [Attachment]
  userId: String
`;

export const commonMutationParams = `
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
  sourceConversationId: String,
`;

export const copyParams = `companyIds: [String], customerIds: [String], labelIds: [String]`;
