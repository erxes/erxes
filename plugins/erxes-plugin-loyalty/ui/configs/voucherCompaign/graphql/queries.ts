import { commonFields } from '../../commonTypes';

export const voucherCompaignFields = `
  _id
  ${commonFields}
  score
  scoreAction
  voucherType
  productCategoryIds
  productIds
  discountPercent
  bonusProductId
  bonusCount
  spinCompaignId
  spinCount
  lotteryCompaignId
  lotteryCount
`;

const voucherCompaigns = `
  query voucherCompaigns($searchValue: String, $filterStatus: String, $page: Int, $perPage: Int) {
    voucherCompaigns(searchValue: $searchValue, filterStatus: $filterStatus, page: $page, perPage: $perPage) {
      ${voucherCompaignFields}
    }
  }
`;

const voucherCompaignDetail = `
  query voucherCompaignDetail($_id: String) {
    voucherCompaignDetail(_id: $_id) {
      ${voucherCompaignFields}
    }
  }
`;

export default {
  voucherCompaigns,
  voucherCompaignDetail
};
