import { agentQueries } from '@/agent/graphql/resolvers/queries/agent';
import { assignmentQueries } from '@/assignment/graphql/resolvers/queries/assignment';
import { campaignQueries } from '@/campaign/graphql/resolvers/queries/campaign';
import { couponQueries } from '@/coupon/graphql/resolvers/queries/coupon';
import { couponCampaignQueries } from '~/modules/coupon/graphql/resolvers/queries/couponCampaign';
import { donateQueries } from '@/donate/graphql/resolvers/queries/donate';
import { lotteryQueries } from '@/lottery/graphql/resolvers/queries/lottery';
import { lotteryCampaignQueries } from '~/modules/lottery/graphql/resolvers/queries/lotteryCampaign';
import { pricingQueries } from '@/pricing/graphql/resolvers/queries/pricing';
import { scoreQueries } from '@/score/graphql/resolvers/queries/score';
import { spinQueries } from '@/spin/graphql/resolvers/queries/spin';
import { voucherQueries } from '@/voucher/graphql/resolvers/queries/voucher';

export const queries = {
  ...pricingQueries,
  ...agentQueries,
  ...assignmentQueries,
  ...campaignQueries,
  ...couponQueries,
  ...couponCampaignQueries,
  ...donateQueries,
  ...lotteryQueries,
  ...lotteryCampaignQueries,
  ...scoreQueries,
  ...spinQueries,
  ...voucherQueries,
};
