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
} from '@/campaign/graphql/schemas/campaign';

import {
  mutations as CouponMutations,
  queries as CouponQueries,
  types as CouponTypes,
} from '@/coupon/graphql/schemas/coupon';
import{
  mutations as CouponCampaignMutations,
  queries as CouponCampaignQueries,
  types as CouponCampaignTypes
} from '@/coupon/graphql/schemas/couponCampaign';

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
import {
  mutations as LotteryMutations,
  queries as LotteryQueries,
  types as LotteryTypes,
} from '@/lottery/graphql/schemas/lottery';
import {
  mutations as LotteryCampaignMutations,
  queries as LotteryCampaignQueries,
  types as LotteryCampaignTypes,
} from '@/lottery/graphql/schemas/lotteryCampaign'
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
import { donateCampaignQueries } from '~/modules/donate/graphql/resolvers/queries/donateCampaign';

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
  ${VoucherTypes}
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
  ${spinsQueries}
  ${voucherQueries}
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
  ${spinsMutations}
  ${voucherMutations}
`;

export default { types, queries, mutations };
