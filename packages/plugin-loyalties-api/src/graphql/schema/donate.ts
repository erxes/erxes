import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Donate @key(fields: "_id") @cacheControl(maxAge: 3) {
    ${commonTypes}
    donateScore: Float
    awardId: String
    voucherId: String
  }

  type DonateMain {
    list: [Donate]
    totalCount: Int
  }
`;

export const queries = `
  donatesMain(${commonFilters}): DonateMain
  donates(${commonFilters}): [Donate]
  donateDetail(_id: String!): Donate
`;

const DonateDoc = `
  ${commonInputs}
  donateScore: Float
`;

export const mutations = `
  donatesAdd(${DonateDoc}): Donate
  donatesRemove(_ids: [String]): JSON
  cpDonatesAdd(${DonateDoc}): Donate
  cpDonatesRemove(_ids: [String]): JSON
`;
