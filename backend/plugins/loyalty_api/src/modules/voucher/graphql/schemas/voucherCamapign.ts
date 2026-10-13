import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';
import { commonCampaignInputs, commonCampaignTypes } from '~/utils/common';

export const types = `
  type VoucherOwnerLimit {
    count: Int
    period: String
  }

  input VoucherOwnerLimitInput {
    count: Int!
    period: String!
  }

  type VoucherAutoIssuePart {
    engine: String
    id: String
  }

  input VoucherAutoIssuePartInput {
    engine: String!
    id: String!
  }

  type VoucherAutoIssue {
    kind: String
    segmentId: String
    parts: [VoucherAutoIssuePart]
  }

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
    perOwnerLimit: VoucherOwnerLimit
    autoIssue: [VoucherAutoIssue]
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
  excludeVoucherTypes: [String],

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
  perOwnerLimit: VoucherOwnerLimitInput
`;

export const mutations = `
  voucherCampaignsAdd(${mutationParams}): VoucherCampaign
  voucherCampaignsEdit(_id: String!, ${mutationParams}): VoucherCampaign
  voucherCampaignsRemove(_ids: [String]): JSON
  voucherCampaignSetAutoIssue(
    _id: String!
    kind: String!
    segmentId: String!
    parts: [VoucherAutoIssuePartInput!]!
  ): VoucherCampaign
  voucherCampaignRemoveAutoIssue(_id: String!, kind: String!): VoucherCampaign
`;
