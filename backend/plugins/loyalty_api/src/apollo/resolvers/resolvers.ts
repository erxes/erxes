import { Pricing } from '@/pricing/graphql/resolvers/customResolvers/pricing';
import agent from '@/agent/graphql/resolvers/customResolvers/agent';
import { Assignment } from '@/assignment/graphql/resolvers/customResolvers/assignment';
import campaign from '@/campaign/graphql/resolvers/customResolvers/campaign';
import { Coupon } from '@/coupon/graphql/resolvers/customResolvers/coupon';
import { Donate } from '@/donate/graphql/resolvers/customResolvers/donate';
import { Lottery } from '@/lottery/graphql/resolvers/customResolvers/lottery';
import { Score } from '@/score/graphql/resolvers/customResolvers/score';
import { Spin } from '@/spin/graphql/resolvers/customResolvers/spin';
import voucher from '@/voucher/graphql/resolvers/customResolvers/voucher';

export const customResolvers = {
  Pricing,
  agent,
  Assignment,
  campaign,
  Coupon,
  Donate,
  Lottery,
  Score,
  Spin,
  voucher
};
