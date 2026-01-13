import {
  mutations as PricingMutations,
  queries as PricingQueries,
  types as PricingTypes,
} from '@/pricing/graphql/schemas/pricing';

import {
  mutations as AgentMutations,
  queries as AgentQueries,
  types as AgentTypes,
} from '@/agent/graphql/schemas/agent';

import {
  mutations as AssignmentMutations,
  queries as AssignmentQueries,
  types as AssignmentTypes,
} from '@/assignment/graphql/schemas/assignment';

import {
  mutations as CampaignMutations,
  queries as CampaignQueries,
  types as CampaignTypes,
} from '@/assignment/graphql/schemas/assignment';

import {
  mutations as CouponMutations,
  queries as CouponQueries,
  types as CouponTypes,
} from '@/coupon/graphql/schemas/coupon';

import {
  mutations as DonateMutations,
  queries as DonateQueries,
  types as DonateTypes,
} from '@/donate/graphql/schemas/donate';

import {
  mutations as LotteryMutations,
  queries as LotteryQueries,
  types as LotteryTypes,
} from '@/lottery/graphql/schemas/lottery';

import {
  mutations as ScoreMutations,
  queries as ScoreQueries,
  types as ScoreTypes,
} from '@/score/graphql/schemas/score';

import {
  mutations as spinsMutations,
  queries as spinsQueries,
  types as SpinTypes,
} from '@/spin/graphql/schemas/spin';

import {
  mutations as voucherMutations,
  queries as voucherQueries,
  types as VoucherTypes,
} from '@/voucher/graphql/schemas/voucher';

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
  ${VoucherTypes}
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
  ${spinsQueries}
  ${voucherQueries}
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
  ${spinsMutations}
  ${voucherMutations}
`;

export default { types, queries, mutations };
