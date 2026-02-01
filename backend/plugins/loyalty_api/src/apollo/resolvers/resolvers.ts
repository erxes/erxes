import { Agent } from '@/agent/graphql/resolvers/customResolvers/agent';
import Campaign from '@/campaign/graphql/resolvers/customResolvers/campaign';
import { Coupon } from '@/coupon/graphql/resolvers/customResolvers/coupon';
import Donate from '@/donate/graphql/resolvers/customResolvers/donate';
import Lottery from '@/lottery/graphql/resolvers/customResolvers/lottery';
import LotteryCampaign from '@/lottery/graphql/resolvers/customResolvers/lotteryCampaign';
import { Pricing } from '@/pricing/graphql/resolvers/customResolvers/pricing';
import Score from '@/score/graphql/resolvers/customResolvers/score';
import ScoreCampaign from '@/score/graphql/resolvers/customResolvers/scoreLogItem';
import Spin from '@/spin/graphql/resolvers/customResolvers/spin';
import SpinCampaign from '@/spin/graphql/resolvers/customResolvers/spinCampaign';
import Voucher from '@/voucher/graphql/resolvers/customResolvers/voucher';
import VoucherCampaign from '@/voucher/graphql/resolvers/customResolvers/voucherCampaign';
import { assignmentCampaignResolvers as AssignmentCampaign } from '~/modules/assignment/graphql/resolvers/customResolvers/assigmentCampaign';
import { Assignment } from '~/modules/assignment/graphql/resolvers/customResolvers/assignment';
import { donateCampaignResolvers as DonateCampaign } from '~/modules/donate/graphql/resolvers/customResolvers/donateCampaign';

export const customResolvers = {
  Pricing,
  Agent,
  Assignment,
  AssignmentCampaign,
  Campaign,
  Coupon,
  Donate,
  DonateCampaign,
  Lottery,
  LotteryCampaign,
  Score,
  ScoreCampaign,
  Spin,
  SpinCampaign,
  Voucher,
  VoucherCampaign,
};
