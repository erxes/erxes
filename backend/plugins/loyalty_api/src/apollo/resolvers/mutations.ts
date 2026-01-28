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
import { lotteryCampaignMutations } from '~/modules/lottery/graphql/resolvers/mutations/lotteryCampaign';

export const mutations = {
  ...pricingMutations,
  ...agentMutations,
  ...assignmentMutations,
  ...campaignMutations,
  ...couponMutations,
  ...donateMutations,
  ...lotteryMutations,
  ...lotteryCampaignMutations,
  ...scoreMutations,
  ...spinsMutations,
  ...voucherMutations,
};
