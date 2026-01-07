import { pricingMutations } from '@/pricing/graphql/resolvers/mutations/pricing';
import { agentMutations } from '~/modules/agent/graphql/resolvers/mutations/agent';
import { assignmentMutations } from '~/modules/assignment/graphql/resolvers/mutations/assignment';
import { campaignMutations } from '~/modules/campaign/graphql/resolvers/mutations/campaign';
import { couponMutations } from '~/modules/coupon/graphql/resolvers/mutations/coupon';
import { donateMutations } from '~/modules/donate/graphql/resolvers/mutations/donate';
import { lotteryMutations } from '~/modules/lottery/graphql/resolvers/mutations/lottery';
import { scoreMutations } from '~/modules/score/graphql/resolvers/mutations/score';
import { spinsMutations } from '~/modules/spin/graphql/resolvers/mutations/spin';
import { voucherMutations } from '~/modules/voucher/graphql/resolvers/mutations/voucher';

export const mutations = {
  ...pricingMutations,
  ...agentMutations,
  ...assignmentMutations,
  ...campaignMutations,
  ...couponMutations,
  ...donateMutations,
  ...lotteryMutations,
  ...scoreMutations,
  ...spinsMutations,
  ...voucherMutations
};
