import { commonCompaignInputs, commonCompaignTypes, commonFilterTypes, paginateTypes } from './common';

export const types = `
  type SpinCompaign {
    _id: String,
    ${commonCompaignTypes}
    buyScore: Float,
    awards: JSON

    spinsCount: Int,
  }
`;

const SpinCompaignDoc = `
  ${commonCompaignInputs}
  buyScore: Float,
  awards: JSON
`

export const queries = `
  spinCompaignDetail(_id: String!): SpinCompaign
  spinCompaigns(${commonFilterTypes} ${paginateTypes}): [SpinCompaign]
  spinCompaignsCount(${commonFilterTypes}): Int
`;

export const mutations = `
  spinCompaignsAdd(${SpinCompaignDoc}): SpinCompaign
  spinCompaignsEdit(_id: String!, ${SpinCompaignDoc}): SpinCompaign
  spinCompaignsRemove(_ids: [String]): JSON
`;
