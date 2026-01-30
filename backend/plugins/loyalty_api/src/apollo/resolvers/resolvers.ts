import { Pricing } from '@/pricing/graphql/resolvers/customResolvers/pricing';
import { Agent } from '@/agent/graphql/resolvers/customResolvers/agent';
import { Assignment } from '~/modules/assignment/graphql/resolvers/customResolvers/assignment';
import { default as Campaign } from '@/campaign/graphql/resolvers/customResolvers/campaign';
import { Coupon } from '@/coupon/graphql/resolvers/customResolvers/coupon';
import { default as Donate } from '@/donate/graphql/resolvers/customResolvers/donate';
import { default as Lottery } from '@/lottery/graphql/resolvers/customResolvers/lottery';
import { default as LotteryCampaign } from '@/lottery/graphql/resolvers/customResolvers/lotteryCampaign';
import { donateCampaignResolvers as DonateCampaign } from '~/modules/donate/graphql/resolvers/customResolvers/donateCampaign';
import { assignmentCampaignResolvers as AssignmentCampaign} from '~/modules/assignment/graphql/resolvers/customResolvers/assigmentCampaign';
import {default as Score}  from '@/score/graphql/resolvers/customResolvers/score';
import {default as ScoreCampaign } from '@/score/graphql/resolvers/customResolvers/scoreLogItem';
import { default as Spin } from '@/spin/graphql/resolvers/customResolvers/spin';
import { default as SpinCampaign } from '@/spin/graphql/resolvers/customResolvers/spinCampaign';
import { default as Voucher} from '@/voucher/graphql/resolvers/customResolvers/voucher';
import {default as VoucherCampaign}  from '@/voucher/graphql/resolvers/customResolvers/voucherCampaign'

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
