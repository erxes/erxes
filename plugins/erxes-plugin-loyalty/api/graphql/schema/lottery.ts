import { commonTypes, commonInputs, commonFilters } from './common';

export const types = `
  type Lottery {
    ${commonTypes}
    status: String
  }

  type LotteryMain {
    list: [Lottery]
    totalCount: Int
  }
`;

const LotteryDoc = `
  ${commonInputs}
  status: String
`
export const queries = `
  lotteriesMain(${commonFilters}): LotteryMain
  lotteries(${commonFilters}): [Lottery]
  lotteryDetail(_id: String!): Lottery
`;

export const mutations = `
  lotteriesAdd(${LotteryDoc}): Lottery
  lotteriesEdit(_id: String!, ${LotteryDoc}): Lottery
  lotteriesRemove(_ids: [String]): JSON
`;
