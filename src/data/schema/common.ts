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
  order: Int
  createdAt: Date
  hasNotified: Boolean
  name: String!
  stageId: String
  assignedUserIds: [String]
  closeDate: Date
  description: String
  modifiedAt: Date
  modifiedBy: String
  reminderMinute: Int,
  isComplete: Boolean,
`;
