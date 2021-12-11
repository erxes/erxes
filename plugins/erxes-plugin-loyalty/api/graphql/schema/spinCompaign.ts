import { commonInputs, commonTypes } from './common';

export const types = `
  type SpinCompaign {
    _id: String,
    ${commonTypes}
    byScore: Float,
    awards: JSON
  }
`;

const SpinCompaignDoc = `
  ${commonInputs}
  byScore: Float,
  awards: JSON
`

export const queries = `
  spinCompaignDetail(_id: String!): SpinCompaign
  spinCompaigns(searchValue: String, filterStatus: String, page: Int, perPage: Int): [SpinCompaign]
`;

export const mutations = `
  spinCompaignsAdd(${SpinCompaignDoc}): SpinCompaign
  spinCompaignsEdit(_id: String!, ${SpinCompaignDoc}): SpinCompaign
  spinCompaignsRemove(_ids: [String]): JSON
`;
