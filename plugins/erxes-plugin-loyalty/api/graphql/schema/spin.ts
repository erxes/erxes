import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Spin {
    ${commonTypes}
    status: String
  }

  type SpinMain {
    list: [Spin]
    totalCount: Int
  }
`;

const SpinDoc = `
  ${commonInputs}
  status: String
`
export const queries = `
  spinsMain(${commonFilters}): SpinMain
  spins(${commonFilters}): [Spin]
  spinDetail(_id: String!): Spin
`;

export const mutations = `
  spinsAdd(${SpinDoc}): Spin
  spinsEdit(_id: String!, ${SpinDoc}): Spin
  spinsRemove(_ids: [String]): JSON
`;
