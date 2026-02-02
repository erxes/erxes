import { agentMutations } from '@/agent/graphql/resolvers/mutations/agent';
import { assignmentMutations } from '@/assignment/graphql/resolvers/mutations/assignment';
import { campaignMutations } from '@/campaign/graphql/resolvers/mutations/campaign';
import { couponMutations } from '@/coupon/graphql/resolvers/mutations/coupon';
import { donateMutations } from '@/donate/graphql/resolvers/mutations/donate';
import { lotteryMutations } from '@/lottery/graphql/resolvers/mutations/lottery';
import { pricingMutations } from '@/pricing/graphql/resolvers/mutations/pricing';
import { scoreMutations } from '@/score/graphql/resolvers/mutations/score';
import { spinsMutations } from '@/spin/graphql/resolvers/mutations/spin';
import { voucherMutations } from '@/voucher/graphql/resolvers/mutations/voucher';
import { assignmentCampaignMutations } from '~/modules/assignment/graphql/resolvers/mutations/assignmentCampaign';
import { couponCampaignMutations } from '~/modules/coupon/graphql/resolvers/mutations/couponCampaign';
import { donateCampaignMutations } from '~/modules/donate/graphql/resolvers/mutations/donateCampaign';
import { lotteryCampaignMutations } from '~/modules/lottery/graphql/resolvers/mutations/lotteryCampaign';
import { scoreCampaignMutations } from '~/modules/score/graphql/resolvers/mutations/scoreCampaign';
import { spinCampaignMutations } from '~/modules/spin/graphql/resolvers/mutations/spinCampaign';
import { voucherCampaignMutations } from '~/modules/voucher/graphql/resolvers/mutations/voucherCampaign';

export const mutations = {
  ...pricingMutations,
  ...agentMutations,
  ...assignmentCampaignMutations,
  ...assignmentMutations,
  ...campaignMutations,
  ...couponMutations,
  ...couponCampaignMutations,
  ...donateMutations,
  ...donateCampaignMutations,
  ...lotteryMutations,
  ...lotteryCampaignMutations,
  ...scoreMutations,
  ...scoreCampaignMutations,
  ...spinsMutations,
  ...spinCampaignMutations,
  ...voucherMutations,
  ...voucherCampaignMutations
};
