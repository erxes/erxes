import { commonCompaignInputs, commonCompaignTypes } from './common';

export const types = `
  type DonateCompaign {
    _id: String,
    ${commonCompaignTypes}

    maxScore: Float
    awards: JSON
  }
`;

const DonateCompaignDoc = `
  ${commonCompaignInputs}
  maxScore: Float
  awards: JSON
`

export const queries = `
  donateCompaignDetail(_id: String!): DonateCompaign
  donateCompaigns(searchValue: String, filterStatus: String, page: Int, perPage: Int): [DonateCompaign]
`;

export const mutations = `
  donateCompaignsAdd(${DonateCompaignDoc}): DonateCompaign
  donateCompaignsEdit(_id: String!, ${DonateCompaignDoc}): DonateCompaign
  donateCompaignsRemove(_ids: [String]): JSON
`;
