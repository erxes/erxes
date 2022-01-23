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

export const paginateTypes = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const commonFilterTypes = `
  searchValue: String,
  filterStatus: String,
`

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
  usedAt: Date,

  ownerType: String,
  ownerId: String,
`;

export const commonFilters = `
  ${paginateTypes}

  searchValue: String,
  compaignId: String,
  ownerType: String,
  ownerId: String,
  status: String,
`
