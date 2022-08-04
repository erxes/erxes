import { commonCampaignInputs, commonCampaignTypes, commonFilterTypes, paginateTypes } from './common';

export const types = `
  type VoucherCampaign @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    ${commonCampaignTypes}
    buyScore: Float,

    score: Float,
    scoreAction: String,

    voucherType: String,

    productCategoryIds: [String],
    productIds: [String],
    discountPercent: Float,

    bonusProductId: String,
    bonusCount: Float,

    coupon: String,

    spinCampaignId: String,
    spinCount: Float,

    lotteryCampaignId: String,
    lotteryCount: Float,

    vouchersCount: Int,
  }
`;

export const queries = `
  voucherCampaignDetail(_id: String): VoucherCampaign
  voucherCampaigns(${commonFilterTypes} ${paginateTypes} equalTypeCampaignId: String voucherType: String): [VoucherCampaign]
  cpVoucherCampaigns: [VoucherCampaign]
  voucherCampaignsCount(${commonFilterTypes}): Int
`;

const VoucherCampaignDoc = `
  ${commonCampaignInputs}
  buyScore: Float,

  score: Float,
  scoreAction: String,

  voucherType: String,

  productCategoryIds: [String],
  productIds: [String],
  discountPercent: Float,

  bonusProductId: String,
  bonusCount: Float,

  coupon: String,

  spinCampaignId: String,
  spinCount: Float,

  lotteryCampaignId: String,
  lotteryCount: Float,
`

export const mutations = `
  voucherCampaignsAdd(${VoucherCampaignDoc}): VoucherCampaign
  voucherCampaignsEdit(_id: String!, ${VoucherCampaignDoc}): VoucherCampaign
  voucherCampaignsRemove(_ids: [String]): JSON
`;
