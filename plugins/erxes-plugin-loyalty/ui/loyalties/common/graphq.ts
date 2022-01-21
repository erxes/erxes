export const commonFields = `
  _id
  compaignId
  createdAt
  usedAt
  ownerType
  ownerId

  owner
`;

export const commonParamsDef = `
  $page: Int
  $perPage: Int
  $compaignId: String
`;

export const commonParamsValue = `
  page: $page
  perPage: $perPage
  compaignId: $compaignId
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
