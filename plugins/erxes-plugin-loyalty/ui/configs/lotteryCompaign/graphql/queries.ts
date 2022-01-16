import { commonFields } from '../../commonTypes';

export const lotteryCompaignFields = `
  _id
  ${commonFields}
  lotteryDate
  numberFormat
  buyScore
  awards
`;

const lotteryCompaigns = `
  query lotteryCompaigns($searchValue: String, $filterStatus: String, $page: Int, $perPage: Int) {
    lotteryCompaigns(searchValue: $searchValue, filterStatus: $filterStatus, page: $page, perPage: $perPage) {
      ${lotteryCompaignFields}
    }
  }
`;

const lotteryCompaignDetail = `
  query lotteryCompaignDetail($_id: String) {
    lotteryCompaignDetail(_id: $_id) {
      ${lotteryCompaignFields}
    }
  }
`;

export default {
  lotteryCompaigns,
  lotteryCompaignDetail
};
