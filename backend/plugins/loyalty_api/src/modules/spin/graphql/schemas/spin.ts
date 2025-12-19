export const types = `
  type Spin {
    _id: String
    campaignId: String
    ownerType: String
    ownerId: String

    status: String
    awardId: String
    voucherId: String
  }

  type SpinListResponse {
    list: [Spin]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  campaignId: String
  status: String
  ownerType: String
  ownerId: String
`;

export const queries = `
  getSpins(${queryParams}): SpinListResponse
`;

const mutationParams = `
  campaignId: String
  ownerType: String
  ownerId: String

  status: String
`;

export const mutations = `
  createSpin(${mutationParams}): Spin
  updateSpin(_id: String!, ${mutationParams}): Spin
  removeSpin(_id: String!): Spin
  doSpin(_id: String!): Spin
  buySpin(campaignId: String, ownerType: String, ownerId: String, count: Int): Spin
`;
