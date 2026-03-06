import Agent from '@/agent/graphql/resolvers/customResolvers/agent';
import Assignment from '@/assignment/graphql/resolvers/customResolvers/assignment';
import AssignmentCampaign from '@/assignment/graphql/resolvers/customResolvers/assignmentCampaign';
import Coupon from '@/coupon/graphql/resolvers/customResolvers/coupon';
import Donate from '@/donate/graphql/resolvers/customResolvers/donate';
import DonateCampaign from '@/donate/graphql/resolvers/customResolvers/donateCampaign';
import Lottery from '@/lottery/graphql/resolvers/customResolvers/lottery';
import LotteryCampaign from '@/lottery/graphql/resolvers/customResolvers/lotteryCampaign';
import { Pricing } from '@/pricing/graphql/resolvers/customResolvers/pricing';
import ScoreCampaign from '@/score/graphql/resolvers/customResolvers/scoreLogItem';
import Spin from '@/spin/graphql/resolvers/customResolvers/spin';
import SpinCampaign from '@/spin/graphql/resolvers/customResolvers/spinCampaign';
import Voucher from '@/voucher/graphql/resolvers/customResolvers/voucher';
import VoucherCampaign from '@/voucher/graphql/resolvers/customResolvers/voucherCampaign';

export const customResolvers = {
  Pricing,
  Agent,
  Assignment,
  AssignmentCampaign,
  Coupon,
  Donate,
  DonateCampaign,
  Lottery,
  LotteryCampaign,
  ScoreCampaign,
  Spin,
  SpinCampaign,
  Voucher,
  VoucherCampaign,
};
