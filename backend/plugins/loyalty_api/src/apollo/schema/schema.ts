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

/* -------------------- Campaign -------------------- */
import {
  mutations as CampaignMutations,
  queries as CampaignQueries,
  types as CampaignTypes,
} from '@/campaign/graphql/schemas/campaign';

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
  mutations as ScoreMutations,
  queries as ScoreQueries,
  types as ScoreTypes,
} from '@/score/graphql/schemas/score';


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


export const types = `
  ${TypeExtensions}

  ${PricingTypes}
  ${AgentTypes}
  ${AssignmentTypes}
  ${CampaignTypes}

  ${CouponTypes}
  ${CouponCampaignTypes}

  ${DonateTypes}
  ${DonateCampaignTypes}

  ${LotteryTypes}
  ${LotteryCampaignTypes}

  ${ScoreTypes}

  ${SpinTypes}
  ${SpinCampaignTypes}

  ${VoucherTypes}
  ${VoucherCampaignTypes}
`;

export const queries = `
  ${PricingQueries}
  ${AgentQueries}
  ${AssignmentQueries}
  ${CampaignQueries}

  ${CouponQueries}
  ${CouponCampaignQueries}

  ${DonateQueries}
  ${DonateCampaignQueries}

  ${LotteryQueries}
  ${LotteryCampaignQueries}

  ${ScoreQueries}

  ${SpinQueries}
  ${SpinCampaignQueries}

  ${VoucherQueries}
  ${VoucherCampaignQueries}
`;

export const mutations = `
  ${PricingMutations}
  ${AgentMutations}
  ${AssignmentMutations}
  ${CampaignMutations}

  ${CouponMutations}
  ${CouponCampaignMutations}

  ${DonateMutations}
  ${DonateCampaignMutations}

  ${LotteryMutations}
  ${LotteryCampaignMutations}

  ${ScoreMutations}

  ${SpinMutations}
  ${SpinCampaignMutations}

  ${VoucherMutations}
  ${VoucherCampaignMutations}
`;

export default { types, queries, mutations };
