import {
  mutations as PricingMutations,
  queries as PricingQueries,
  types as PricingTypes,
} from '@/pricing/graphql/schemas/pricing';

import {
  types as AgentTypes,
  queries as AgentQueries,
  mutations as AgentMutations,
} from '@/agent/graphql/schemas/agent';

import {
  types as AssignmentTypes,
  queries as AssignmentQueries,
  mutations as AssignmentMutations,
} from '@/assignment/graphql/schemas/assignment';

import {
  types as CampaignTypes,
  queries as CampaignQueries,
  mutations as CampaignMutations,
} from '@/campaign/graphql/schemas/campaign';

import {
  types as CouponTypes,
  queries as CouponQueries,
  mutations as CouponMutations,
} from '@/coupon/graphql/schemas/coupon';

import {
  types as DonateTypes,
  queries as DonateQueries,
  mutations as DonateMutations,
} from '@/donate/graphql/schemas/donate';

import {
  types as LotteryTypes,
  queries as LotteryQueries,
  mutations as LotteryMutations,
} from '@/lottery/graphql/schemas/lottery';

import {
  types as ScoreTypes,
  queries as ScoreQueries,
  mutations as ScoreMutations,
} from '@/score/graphql/schemas/score';

import {
  types as SpinTypes,
  queries as SpinQueries,
  mutations as SpinMutations,
} from '@/spin/graphql/schemas/spin';

import { TypeExtensions } from './extensions';

export const types = `
  ${TypeExtensions}

  ${PricingTypes}
  ${AgentTypes}
  ${AssignmentTypes}
  ${CampaignTypes}
  ${CouponTypes}
  ${DonateTypes}
  ${LotteryTypes}
  ${ScoreTypes}
  ${SpinTypes}
`;

export const queries = `
  ${PricingQueries}
  ${AgentQueries}
  ${AssignmentQueries}
  ${CampaignQueries}
  ${CouponQueries}
  ${DonateQueries}
  ${LotteryQueries}
  ${ScoreQueries}
  ${SpinQueries}
`;

export const mutations = `
  ${PricingMutations}
  ${AgentMutations}
  ${AssignmentMutations}
  ${CampaignMutations}
  ${CouponMutations}
  ${DonateMutations}
  ${LotteryMutations}
  ${ScoreMutations}
  ${SpinMutations}
`;

export default { types, queries, mutations };
