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
};
