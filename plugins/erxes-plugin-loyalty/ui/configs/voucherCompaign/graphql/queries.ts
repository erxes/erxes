import { commonFields, commonFilterDefs, commonFilterValues, paginateDefs, paginateValues } from '../../commonTypes';

export const voucherCompaignFields = `
  _id
  ${commonFields}
  buyScore

  score
  scoreAction
  voucherType
  productCategoryIds
  productIds
  discountPercent
  bonusProductId
  bonusCount
  coupon
  spinCompaignId
  spinCount
  lotteryCompaignId
  lotteryCount

  vouchersCount
`;

const voucherCompaigns = `
  query voucherCompaigns(${commonFilterDefs} ${paginateDefs} $equalTypeCompaignId: String) {
    voucherCompaigns(${commonFilterValues} ${paginateValues} equalTypeCompaignId: $equalTypeCompaignId) {
      ${voucherCompaignFields}
    }
  }
`;

const voucherCompaignsCount = `
  query voucherCompaignsCount(${commonFilterDefs}) {
    voucherCompaignsCount(${commonFilterValues})
  }
`;

const voucherCompaignDetail = `
  query voucherCompaignDetail($_id: String!) {
    voucherCompaignDetail(_id: $_id) {
      ${voucherCompaignFields}
    }
  }
`;

export default {
  voucherCompaigns,
  voucherCompaignsCount,
  voucherCompaignDetail
};
