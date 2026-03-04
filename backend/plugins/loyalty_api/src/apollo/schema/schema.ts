import { TypeExtensions } from './extensions';

/* -------------------- Pricing -------------------- */
import {
  mutations as PricingMutations,
  queries as PricingQueries,
  types as PricingTypes,
} from '@/pricing/graphql/schemas/pricing';

/* -------------------- Agent -------------------- */
import {
  mutations as AgentMutations,
  queries as AgentQueries,
  types as AgentTypes,
} from '@/agent/graphql/schemas/agent';

/* -------------------- Assignment -------------------- */
import {
  mutations as AssignmentMutations,
  queries as AssignmentQueries,
  types as AssignmentTypes,
} from '@/assignment/graphql/schemas/assignment';

import {
  mutations as AssignmentCampaignMutations,
  queries as AssignmentCampaignQueries,
  types as AssignmentCampaignTypes,
} from '@/assignment/graphql/schemas/assignmentCampaign';

/* -------------------- Coupon -------------------- */
import {
  mutations as CouponMutations,
  queries as CouponQueries,
  types as CouponTypes,
} from '@/coupon/graphql/schemas/coupon';

import {
  mutations as CouponCampaignMutations,
  queries as CouponCampaignQueries,
  types as CouponCampaignTypes,
} from '@/coupon/graphql/schemas/couponCampaign';

/* -------------------- Donate -------------------- */
import {
  mutations as DonateMutations,
  queries as DonateQueries,
  types as DonateTypes,
} from '@/donate/graphql/schemas/donate';

import {
  mutations as DonateCampaignMutations,
  queries as DonateCampaignQueries,
  types as DonateCampaignTypes,
} from '@/donate/graphql/schemas/donateCampaign';

/* -------------------- Lottery -------------------- */
import {
  mutations as LotteryMutations,
  queries as LotteryQueries,
  types as LotteryTypes,
} from '@/lottery/graphql/schemas/lottery';

import {
  mutations as LotteryCampaignMutations,
  queries as LotteryCampaignQueries,
  types as LotteryCampaignTypes,
} from '@/lottery/graphql/schemas/lotteryCampaign';

/* -------------------- Score -------------------- */
import {
  mutations as ScoreLogMutations,
  queries as ScoreLogQueries,
  types as ScoreLogTypes,
} from '@/score/graphql/schemas/scoreLog';

import {
  mutations as ScoreCampaignMutations,
  queries as ScoreCampaignQueries,
  types as ScoreCampaignTypes,
} from '@/score/graphql/schemas/scoreCampaign';

/* -------------------- Spin -------------------- */
import {
  mutations as SpinMutations,
  queries as SpinQueries,
  types as SpinTypes,
} from '@/spin/graphql/schemas/spin';

import {
  mutations as SpinCampaignMutations,
  queries as SpinCampaignQueries,
  types as SpinCampaignTypes,
} from '@/spin/graphql/schemas/spinCampaign';

/* -------------------- Voucher -------------------- */
import {
  mutations as VoucherMutations,
  queries as VoucherQueries,
  types as VoucherTypes,
} from '@/voucher/graphql/schemas/voucher';

import {
  mutations as VoucherCampaignMutations,
  queries as VoucherCampaignQueries,
  types as VoucherCampaignTypes,
} from '@/voucher/graphql/schemas/voucherCamapign';

/* -------------------- Loyalty -------------------- */
import {
  mutations as LoyaltyConfigMutations,
  queries as LoyaltyConfigQueries,
  types as LoyaltyConfigTypes,
} from '@/config/graphql/schemas/config';

import {
  mutations as LoyaltyMutations,
  queries as LoyaltyQueries,
  types as LoyaltyTypes,
} from '@/config/graphql/schemas/loyalty';

export const types = `
  ${TypeExtensions}

  ${PricingTypes}

  ${AgentTypes}

  ${AssignmentTypes}
  ${AssignmentCampaignTypes}

  ${CouponTypes}
  ${CouponCampaignTypes}

  ${DonateTypes}
  ${DonateCampaignTypes}

  ${LotteryTypes}
  ${LotteryCampaignTypes}

  ${ScoreLogTypes}
  ${ScoreCampaignTypes}

  ${SpinTypes}
  ${SpinCampaignTypes}

  ${VoucherTypes}
  ${VoucherCampaignTypes}

  ${LoyaltyConfigTypes}
  ${LoyaltyTypes}
`;

export const queries = `
  ${PricingQueries}

  ${AgentQueries}

  ${AssignmentQueries}
  ${AssignmentCampaignQueries}

  ${CouponQueries}
  ${CouponCampaignQueries}

  ${DonateQueries}
  ${DonateCampaignQueries}

  ${LotteryQueries}
  ${LotteryCampaignQueries}

  ${ScoreLogQueries}
  ${ScoreCampaignQueries}

  ${SpinQueries}
  ${SpinCampaignQueries}

  ${VoucherQueries}
  ${VoucherCampaignQueries}

  ${LoyaltyConfigQueries}
  ${LoyaltyQueries}
`;

export const mutations = `
  ${PricingMutations}

  ${AgentMutations}

  ${AssignmentMutations}
  ${AssignmentCampaignMutations}

  ${CouponMutations}
  ${CouponCampaignMutations}

  ${DonateMutations}
  ${DonateCampaignMutations}

  ${LotteryMutations}
  ${LotteryCampaignMutations}

  ${ScoreLogMutations}
  ${ScoreCampaignMutations}

  ${SpinMutations}
  ${SpinCampaignMutations}

  ${VoucherMutations}
  ${VoucherCampaignMutations}

  ${LoyaltyConfigMutations}
  ${LoyaltyMutations}
`;

export default { types, queries, mutations };
