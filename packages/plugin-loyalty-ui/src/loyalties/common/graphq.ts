export const commonFields = `
  _id
  compaignId
  createdAt
  usedAt
  ownerType
  ownerId
  voucherCompaignId

  owner
`;

export const commonParamsDef = `
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $compaignId: String
  $status: String
  $ownerId: String
  $ownerType: String
`;

export const commonParamsValue = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
  compaignId: $compaignId
  status: $status
  ownerId: $ownerId
  ownerType: $ownerType
`;

// mutation
export const commonDefs = `
  $compaignId: String,
  $usedAt: Date,
  $ownerType: String,
  $ownerId: String
`;

export const commonVariables = `
  compaignId: $compaignId,
  usedAt: $usedAt,
  ownerType: $ownerType,
  ownerId: $ownerId
`;
