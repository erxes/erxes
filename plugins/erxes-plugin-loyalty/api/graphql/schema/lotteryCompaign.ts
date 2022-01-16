import { commonInputs, commonTypes } from './common';

export const types = `
  type LotteryCompaign {
    _id: String,
    ${commonTypes}
    lotteryDate: Date,
    numberFormat: String,
    buyScore: Float,
    awards: JSON
  }
`;

const LotteryCompaignDoc = `
  ${commonInputs}
  lotteryDate: Date,
  numberFormat: String,
  buyScore: Float,
  awards: JSON
`

export const queries = `
  lotteryCompaignDetail(_id: String!): LotteryCompaign
  lotteryCompaigns(searchValue: String, filterStatus: String, page: Int, perPage: Int): [LotteryCompaign]
`;

export const mutations = `
  lotteryCompaignsAdd(${LotteryCompaignDoc}): LotteryCompaign
  lotteryCompaignsEdit(_id: String!, ${LotteryCompaignDoc}): LotteryCompaign
  lotteryCompaignsRemove(_ids: [String]): JSON
`;
