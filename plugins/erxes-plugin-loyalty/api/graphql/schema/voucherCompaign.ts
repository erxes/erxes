import { commonCompaignInputs, commonCompaignTypes, commonFilterTypes, paginateTypes } from './common';

export const types = `
  type VoucherCompaign {
    _id: String,
    ${commonCompaignTypes}
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

    spinCompaignId: String,
    spinCount: Float,

    lotteryCompaignId: String,
    lotteryCount: Float,

    vouchersCount: Int,
  }
`;

const VoucherCompaignDoc = `
  ${commonCompaignInputs}
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

  spinCompaignId: String,
  spinCount: Float,

  lotteryCompaignId: String,
  lotteryCount: Float,
`

export const queries = `
  voucherCompaignDetail(_id: String!): VoucherCompaign
  voucherCompaigns(${commonFilterTypes} ${paginateTypes} equalTypeCompaignId: String): [VoucherCompaign]
  voucherCompaignsCount(${commonFilterTypes}): Int
`;

export const mutations = `
  voucherCompaignsAdd(${VoucherCompaignDoc}): VoucherCompaign
  voucherCompaignsEdit(_id: String!, ${VoucherCompaignDoc}): VoucherCompaign
  voucherCompaignsRemove(_ids: [String]): JSON
`;
