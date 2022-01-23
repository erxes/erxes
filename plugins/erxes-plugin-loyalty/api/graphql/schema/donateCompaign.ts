import { commonCompaignInputs, commonCompaignTypes, commonFilterTypes, paginateTypes } from './common';

export const types = `
  type DonateCompaign {
    _id: String,
    ${commonCompaignTypes}

    maxScore: Float
    awards: JSON

    donatesCount: Int,
  }
`;

const DonateCompaignDoc = `
  ${commonCompaignInputs}
  maxScore: Float
  awards: JSON
`

export const queries = `
  donateCompaignDetail(_id: String!): DonateCompaign
  donateCompaigns(${commonFilterTypes} ${paginateTypes}): [DonateCompaign]
  donateCompaignsCount(${commonFilterTypes}): Int
`;

export const mutations = `
  donateCompaignsAdd(${DonateCompaignDoc}): DonateCompaign
  donateCompaignsEdit(_id: String!, ${DonateCompaignDoc}): DonateCompaign
  donateCompaignsRemove(_ids: [String]): JSON
`;
