import { commonFields, commonFilterDefs, commonFilterValues, paginateDefs, paginateValues } from '../../commonTypes';

export const voucherCampaignFields = `
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
  spinCampaignId
  spinCount
  lotteryCampaignId
  lotteryCount

  vouchersCount
`;

const voucherCampaigns = `
  query voucherCampaigns(${commonFilterDefs} ${paginateDefs} $equalTypeCampaignId: String $voucherType: String) {
    voucherCampaigns(${commonFilterValues} ${paginateValues} equalTypeCampaignId: $equalTypeCampaignId voucherType: $voucherType) {
      ${voucherCampaignFields}
    }
  }
`;

const voucherCampaignsCount = `
  query voucherCampaignsCount(${commonFilterDefs}) {
    voucherCampaignsCount(${commonFilterValues})
  }
`;

const voucherCampaignDetail = `
  query VoucherCampaignDetail($id: String) {
    voucherCampaignDetail(_id: $id) {
      ${voucherCampaignFields}
    }
  }
`;

export default {
  voucherCampaigns,
  voucherCampaignsCount,
  voucherCampaignDetail
};
