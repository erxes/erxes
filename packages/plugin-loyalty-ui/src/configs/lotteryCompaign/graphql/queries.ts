import { commonFields, commonFilterDefs, commonFilterValues, paginateDefs, paginateValues } from '../../commonTypes';

export const lotteryCompaignFields = `
  _id
  ${commonFields}
  numberFormat
  buyScore
  awards

  lotteriesCount
`;

const lotteryCompaigns = `
  query lotteryCompaigns(${commonFilterDefs} ${paginateDefs}) {
    lotteryCompaigns(${commonFilterValues} ${paginateValues}) {
      ${lotteryCompaignFields}
    }
  }
`;

const lotteryCompaignsCount = `
  query lotteryCompaignsCount(${commonFilterDefs}) {
    lotteryCompaignsCount(${commonFilterValues})
  }
`;

const lotteryCompaignDetail = `
  query lotteryCompaignDetail($_id: String!) {
    lotteryCompaignDetail(_id: $_id) {
      ${lotteryCompaignFields}
    }
  }
`;

export default {
  lotteryCompaigns,
  lotteryCompaignsCount,
  lotteryCompaignDetail
};
