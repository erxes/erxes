import { commonCompaignInputs, commonCompaignTypes } from './common';

export const types = `
  type LotteryCompaign {
    _id: String,
    ${commonCompaignTypes}
    lotteryDate: Date,
    numberFormat: String,
    buyScore: Float,
    awards: JSON
  }
`;

const LotteryCompaignDoc = `
  ${commonCompaignInputs}
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
