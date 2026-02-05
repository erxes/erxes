import { agentMutations } from '@/agent/graphql/resolvers/mutations/agent';
import { assignmentMutations } from '@/assignment/graphql/resolvers/mutations/assignment';
import { assignmentCampaignMutations } from '@/assignment/graphql/resolvers/mutations/assignmentCampaign';
import { loyaltyConfigMutations } from '@/config/graphql/mutations/config';
import { loyaltyMutations } from '@/config/graphql/mutations/loyalty';
import { couponMutations } from '@/coupon/graphql/resolvers/mutations/coupon';
import { couponCampaignMutations } from '@/coupon/graphql/resolvers/mutations/couponCampaign';
import { donateMutations } from '@/donate/graphql/resolvers/mutations/donate';
import { donateCampaignMutations } from '@/donate/graphql/resolvers/mutations/donateCampaign';
import { lotteryMutations } from '@/lottery/graphql/resolvers/mutations/lottery';
import { lotteryCampaignMutations } from '@/lottery/graphql/resolvers/mutations/lotteryCampaign';
import { pricingMutations } from '@/pricing/graphql/resolvers/mutations/pricing';
import { scoreCampaignMutations } from '@/score/graphql/resolvers/mutations/scoreCampaign';
import { scoreLogMutations } from '@/score/graphql/resolvers/mutations/scoreLog';
import { spinsMutations } from '@/spin/graphql/resolvers/mutations/spin';
import { spinCampaignMutations } from '@/spin/graphql/resolvers/mutations/spinCampaign';
import { voucherMutations } from '@/voucher/graphql/resolvers/mutations/voucher';
import { voucherCampaignMutations } from '@/voucher/graphql/resolvers/mutations/voucherCampaign';

export const mutations = {
  ...pricingMutations,

  ...agentMutations,

  ...assignmentCampaignMutations,
  ...assignmentMutations,

  ...couponMutations,
  ...couponCampaignMutations,

  ...donateMutations,
  ...donateCampaignMutations,

  ...lotteryMutations,
  ...lotteryCampaignMutations,

  ...scoreLogMutations,
  ...scoreCampaignMutations,

  ...spinsMutations,
  ...spinCampaignMutations,

  ...voucherMutations,
  ...voucherCampaignMutations,

  ...loyaltyConfigMutations,
  ...loyaltyMutations,
};
