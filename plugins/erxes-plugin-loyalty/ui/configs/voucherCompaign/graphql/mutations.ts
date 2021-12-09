import { commonParamDefs, commonParams } from '../../commonTypes';
import { voucherCompaignFields } from './queries';

const paramDefs = `
  ${commonParamDefs}
  $score: Float,
  $scoreAction: String,
  $productCategoryIds: [String],
  $productIds: [String],
  $productDiscountPercent: Float,
  $productLimit: Boolean,
  $productCount: Float,
  $spinCompaignId: String,
  $spinCount: Float,
  $lotteryCompaignId: String,
  $lotteryCount: Float,
`;

const params = `
  ${commonParams}
  score: $score
  scoreAction: $scoreAction
  productCategoryIds: $productCategoryIds
  productIds: $productIds
  productDiscountPercent: $productDiscountPercent
  productLimit: $productLimit
  productCount: $productCount
  spinCompaignId: $spinCompaignId
  spinCount: $spinCount
  lotteryCompaignId: $lotteryCompaignId
  lotteryCount: $lotteryCount
`;

const voucherCompaignsAdd = `
  mutation voucherCompaignsAdd(${paramDefs}) {
    voucherCompaignsAdd(${params}) {
      ${voucherCompaignFields}
    }
  }
`;

const voucherCompaignsEdit = `
  mutation voucherCompaignsEdit($_id: String!, ${paramDefs}) {
    voucherCompaignsEdit(_id: $_id, ${params}) {
      ${voucherCompaignFields}
    }
  }
`;

const voucherCompaignsRemove = `
  mutation voucherCompaignsRemove($_ids: [String]) {
    voucherCompaignsRemove(_ids: $_ids)
  }
`;


export default {
  voucherCompaignsAdd,
  voucherCompaignsEdit,
  voucherCompaignsRemove,
};
