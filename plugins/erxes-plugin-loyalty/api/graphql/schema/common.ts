export const commonCompaignTypes = `
  createdAt: Date,
  createdBy: String,
  modifiedAt: Date,
  modifiedBy: String,

  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  attachment: Attachment,

  status: String,
`;

export const commonCompaignInputs = `
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  attachment: AttachmentInput,
  status: String,
`;

export const commonTypes = `
  _id: String,
  compaignId: String,
  createdAt: Date,
  usedAt: Date,

  ownerType: String,
  ownerId: String,

  company: [Company]
  customer: [Customer]
  user: [User]
  compaign: JSON,
  owner: JSON
`;

export const commonInputs = `
  compaignId: String,
  createdAt: Date,
  usedAt: Date,

  ownerType: String,
  ownerId: String,
`;

export const commonFilters = `
  page: Int,
  perPage: Int,
  compaignId: String,
  compaignType: String,
  ownerType: String,
  ownerId: String,
  statuses: [String],
`
