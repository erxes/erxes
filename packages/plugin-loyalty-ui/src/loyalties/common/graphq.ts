export const commonFields = `
  _id
  campaignId
  createdAt
  usedAt
  ownerType
  ownerId
  voucherCampaignId

  owner
`;

export const commonParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $campaignId: String
  $status: String
  $ownerId: String
  $ownerType: String
`;

export const commonParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
  campaignId: $campaignId
  status: $status
  ownerId: $ownerId
  ownerType: $ownerType
`;

// mutation
export const commonDefs = `
  $campaignId: String,
  $usedAt: Date,
  $ownerType: String,
  $ownerId: String
`;

export const commonVariables = `
  campaignId: $campaignId,
  usedAt: $usedAt,
  ownerType: $ownerType,
  ownerId: $ownerId
`;
