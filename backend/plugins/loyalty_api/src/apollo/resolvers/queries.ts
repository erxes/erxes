import { agentQueries } from '@/agent/graphql/resolvers/queries/agent';
import { assignmentQueries } from '@/assignment/graphql/resolvers/queries/assignment';
import { assignmentCampaignQueries } from '@/assignment/graphql/resolvers/queries/assignmentCampaign';
import { loyaltyConfigQueries } from '@/config/graphql/queries/config';
import { loyaltyQueries } from '@/config/graphql/queries/loyalty';
import { couponQueries } from '@/coupon/graphql/resolvers/queries/coupon';
import { couponCampaignQueries } from '@/coupon/graphql/resolvers/queries/couponCampaign';
import { donateQueries } from '@/donate/graphql/resolvers/queries/donate';
import { donateCampaignQueries } from '@/donate/graphql/resolvers/queries/donateCampaign';
import { lotteryQueries } from '@/lottery/graphql/resolvers/queries/lottery';
import { lotteryCampaignQueries } from '@/lottery/graphql/resolvers/queries/lotteryCampaign';
import { pricingQueries } from '@/pricing/graphql/resolvers/queries/pricing';
import { scoreCampaignQueries } from '@/score/graphql/resolvers/queries/scoreCampaign';
import { scoreLogQueries } from '@/score/graphql/resolvers/queries/scoreLog';
import { spinQueries } from '@/spin/graphql/resolvers/queries/spin';
import { spinCampaignQueries } from '@/spin/graphql/resolvers/queries/spinCampaign';
import { voucherQueries } from '@/voucher/graphql/resolvers/queries/voucher';
import { voucherCampaignQueries } from '@/voucher/graphql/resolvers/queries/voucherCampaign';

export const queries = {
  ...pricingQueries,

  ...agentQueries,

  ...assignmentQueries,
  ...assignmentCampaignQueries,

  ...couponQueries,
  ...couponCampaignQueries,

  ...donateQueries,
  ...donateCampaignQueries,

  ...lotteryQueries,
  ...lotteryCampaignQueries,

  ...scoreLogQueries,
  ...scoreCampaignQueries,

  ...spinQueries,
  ...spinCampaignQueries,

  ...voucherQueries,
  ...voucherCampaignQueries,

  ...loyaltyConfigQueries,
  ...loyaltyQueries,
};
