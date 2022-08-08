export const commonCampaignTypes = `
  createdAt: Date,
  createdBy: String,
  modifiedAt: Date,
  modifiedBy: String,

  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  finishDateOfUse: Date,
  attachment: Attachment,

  status: String,
`;

export const commonCampaignInputs = `
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  finishDateOfUse: Date,
  numberFormat:String,
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
  _ids: [String],
  searchValue: String,
  filterStatus: String,
`;

export const commonTypes = `
  _id: String,
  campaignId: String,
  createdAt: Date,
  usedAt: Date,
  voucherCampaignId: String,

  ownerType: String,
  ownerId: String,

  campaign: JSON,
  owner: JSON
`;

export const commonInputs = `
  campaignId: String,
  usedAt: Date,

  ownerType: String,
  ownerId: String,
`;

export const commonFilters = `
  ${paginateTypes}

  searchValue: String,
  campaignId: String,
  ownerType: String,
  ownerId: String,
  status: String,
`;
