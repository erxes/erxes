import { pricingQueries } from '@/pricing/graphql/resolvers/queries/pricing';
import { agentQueries } from '~/modules/agent/graphql/resolvers/queries/agent';
import { assignmentQueries } from '~/modules/assignment/graphql/resolvers/queries/assignment';
import { campaignQueries } from '~/modules/campaign/graphql/resolvers/queries/campaign';
import { couponQueries } from '~/modules/coupon/graphql/resolvers/queries/coupon';
import { donateQueries } from '~/modules/donate/graphql/resolvers/queries/donate';
import { lotteryQueries } from '~/modules/lottery/graphql/resolvers/queries/lottery';
import { scoreQueries } from '~/modules/score/graphql/resolvers/queries/score';
import { spinQueries } from '~/modules/spin/graphql/resolvers/queries/spin';
import { voucherQueries } from '~/modules/voucher/graphql/resolvers/queries/voucher';

export const queries = {
  ...pricingQueries,
  ...agentQueries,
  ...assignmentQueries,
  ...campaignQueries,
  ...couponQueries,
  ...donateQueries,
  ...lotteryQueries,
  ...scoreQueries,
  ...spinQueries,
  ...voucherQueries
};
