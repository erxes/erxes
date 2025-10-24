import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Spin @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
    status: String
    awardId: String
    voucherId: String
  }

  type SpinMain {
    list: [Spin]
    totalCount: Int
  }
`;

export const queries = `
  spinsMain(${commonFilters} voucherCampaignId: String): SpinMain
  spins(${commonFilters} voucherCampaignId: String): [Spin]
  spinDetail(_id: String!): Spin
`;

const SpinDoc = `
  ${commonInputs}
  status: String
`;

export const mutations = `
  spinsAdd(${SpinDoc}): Spin
  spinsEdit(_id: String!, ${SpinDoc}): Spin
  spinsRemove(_ids: [String]): JSON
  doSpin(_id: String!): Spin
  buySpin(campaignId: String, ownerType: String, ownerId: String, count: Int): Spin
`;
