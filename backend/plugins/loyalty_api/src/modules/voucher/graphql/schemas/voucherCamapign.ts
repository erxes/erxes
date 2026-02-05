import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';
import { commonCampaignInputs, commonCampaignTypes } from '~/utils/common';

export const types = `
  type VoucherCampaign @key(fields: "_id") {
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
    codesCount: Int,

    kind: Kind
    value: Float
    restrictions: JSON
  }

  type VoucherCampaignListResponse {
    list: [VoucherCampaign]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String,
  status: String,
  equalTypeCampaignId: String,
  voucherType: String,
  
  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  voucherCampaigns(${queryParams}): VoucherCampaignListResponse
  voucherCampaignDetail(_id: String): VoucherCampaign
  cpVoucherCampaigns: [VoucherCampaign]
`;

const mutationParams = `
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

  kind: Kind
  value: Float
  restrictions: JSON
`;

export const mutations = `
  voucherCampaignsAdd(${mutationParams}): VoucherCampaign
  voucherCampaignsEdit(_id: String!, ${mutationParams}): VoucherCampaign
  voucherCampaignsRemove(_ids: [String]): JSON
`;
