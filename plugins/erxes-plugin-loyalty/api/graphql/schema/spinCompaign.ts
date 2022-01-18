import { commonCompaignInputs, commonCompaignTypes } from './common';

export const types = `
  type SpinCompaign {
    _id: String,
    ${commonCompaignTypes}
    buyScore: Float,
    awards: JSON
  }
`;

const SpinCompaignDoc = `
  ${commonCompaignInputs}
  buyScore: Float,
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
