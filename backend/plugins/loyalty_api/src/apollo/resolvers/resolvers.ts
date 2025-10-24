import Donate from '@/loyalty/graphql/resolvers/customResolvers/donate';
import DonateCampaign from '@/loyalty/graphql/resolvers/customResolvers/donateCampaign';
import Assignment from '@/loyalty/graphql/resolvers/customResolvers/assignments';
import AssignmentCampaign from '@/loyalty/graphql/resolvers/customResolvers/assignmentCampaign';
import Voucher from '@/loyalty/graphql/resolvers/customResolvers/voucher';
import VoucherCampaign from '@/loyalty/graphql/resolvers/customResolvers/voucherCampaign';
import Spin from '@/loyalty/graphql/resolvers/customResolvers/spin';
import SpinCampaign from '@/loyalty/graphql/resolvers/customResolvers/spinCampaign';
import Lottery from '@/loyalty/graphql/resolvers/customResolvers/lottery';
import LotteryCampaign from '@/loyalty/graphql/resolvers/customResolvers/lotteryCampaign';
import ScoreLog from '@/loyalty/graphql/resolvers/customResolvers/scoreLog';
import Agent from '@/loyalty/graphql/resolvers/customResolvers/agent';
import ScoreLogItem from '@/loyalty/graphql/resolvers/customResolvers/scoreLogItem';
import Coupon from '@/loyalty/graphql/resolvers/customResolvers/coupon';

export const customResolvers = {
  Donate,
  DonateCampaign,
  Assignment,
  AssignmentCampaign,
  Voucher,
  VoucherCampaign,
  Spin,
  SpinCampaign,
  Lottery,
  LotteryCampaign,
  ScoreLog,
  Agent,
  ScoreLogItem,
  Coupon,
};
