export const copyParams = `companyIds: [String], customerIds: [String], labelIds: [String]`;
export const dealMutationParams = `
  paymentsData: JSON,
  productsData: JSON,
`;

export const commonDealMutationParams = `
  parentId:String,
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
  customFieldsData: JSON,
  tagIds: [String],
  branchIds: [String],
  departmentIds: [String],
`;
