import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Donate {
    ${commonTypes}
    status: String
  }

  type DonateMain {
    list: [Donate]
    totalCount: Int
  }
`;

const DonateDoc = `
  ${commonInputs}
  status: String
`
export const queries = `
  donatesMain(${commonFilters}): DonateMain
  donates(${commonFilters}): [Donate]
  donateDetail(_id: String!): Donate
`;

export const mutations = `
  donatesAdd(${DonateDoc}): Donate
  donatesEdit(_id: String!, ${DonateDoc}): Donate
  donatesRemove(_ids: [String]): JSON
`;
