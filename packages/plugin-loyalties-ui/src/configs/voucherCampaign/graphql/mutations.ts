import { commonParamDefs, commonParams } from '../../commonTypes';
import { voucherCampaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs}
  $buyScore: Float,
  $score: Float,
  $scoreAction: String,
  $voucherType: String,
  $productCategoryIds: [String],
  $productIds: [String],
  $discountPercent: Float,
  $bonusProductId: String,
  $bonusCount: Float,
  $coupon: String,
  $spinCampaignId: String,
  $spinCount: Float,
  $lotteryCampaignId: String,
  $lotteryCount: Float,
`;

const params = `
  ${commonParams}
  buyScore: $buyScore
  score: $score
  scoreAction: $scoreAction
  voucherType: $voucherType
  productCategoryIds: $productCategoryIds
  productIds: $productIds
  discountPercent: $discountPercent
  bonusProductId: $bonusProductId
  bonusCount: $bonusCount
  coupon: $coupon
  spinCampaignId: $spinCampaignId
  spinCount: $spinCount
  lotteryCampaignId: $lotteryCampaignId
  lotteryCount: $lotteryCount
`;

const voucherCampaignsAdd = `
  mutation voucherCampaignsAdd(${paramDefs}) {
    voucherCampaignsAdd(${params}) {
      ${voucherCampaignFields}
    }
  }
`;

const voucherCampaignsEdit = `
  mutation voucherCampaignsEdit($_id: String!, ${paramDefs}) {
    voucherCampaignsEdit(_id: $_id, ${params}) {
      ${voucherCampaignFields}
    }
  }
`;

const voucherCampaignsRemove = `
  mutation voucherCampaignsRemove($_ids: [String]) {
    voucherCampaignsRemove(_ids: $_ids)
  }
`;

export default {
  voucherCampaignsAdd,
  voucherCampaignsEdit,
  voucherCampaignsRemove
};
