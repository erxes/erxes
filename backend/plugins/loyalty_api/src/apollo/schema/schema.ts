// import {
//   mutations as BoardMutations,
//   queries as BoardQueries,
//   types as BoardTypes,
// } from '@/sales/graphql/schemas/board';

// import { TypeExtensions } from '@/sales/graphql/schemas/extensions';

// import {
//   mutations as PipelineMutations,
//   queries as PipelineQueries,
//   types as PipelineTypes,
// } from '@/sales/graphql/schemas/pipeline';

import {
  mutations as donateCampaignMutations,
  queries as donateCampaignQueries,
  types as donateCampaignTypes,
} from '@/loyalty/graphql/schemas/donateCampaign';
import {
  mutations as donateMutations,
  queries as donateQueries,
  types as donateTypes,
} from '@/loyalty/graphql/schemas/donate';
import {
  mutations as spinCampaignMutations,
  queries as spinCampaignQueries,
  types as spinCampaignTypes,
} from '@/loyalty/graphql/schemas/spinCampaign';
import {
  mutations as spinMutations,
  queries as spinQueries,
  types as spinTypes,
} from '@/loyalty/graphql/schemas/spin';
import {
  mutations as lotteryCampaignMutations,
  queries as lotteryCampaignQueries,
  types as lotteryCampaignTypes,
} from '@/loyalty/graphql/schemas/lotteryCampaign';
import {
  mutations as lotteryMutations,
  queries as lotteryQueries,
  types as lotteryTypes,
} from '@/loyalty/graphql/schemas/lottery';
import {
  mutations as voucherCampaignMutations,
  queries as voucherCampaignQueries,
  types as voucherCampaignTypes,
} from '@/loyalty/graphql/schemas/voucherCampaign';
import {
  mutations as voucherMutations,
  queries as voucherQueries,
  types as voucherTypes,
} from '@/loyalty/graphql/schemas/voucher';
import {
  mutations as loyaltyMutations,
  queries as loyaltyQueries,
  types as loyaltyTypes,
} from '@/loyalty/graphql/schemas/loyalty';
import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes,
} from '@/loyalty/graphql/schemas/config';
import {
  mutation as ScoreLogMutations,
  queries as scoreLogQueries,
  types as scoreLogTypes,
} from '@/loyalty/graphql/schemas/scoreLog';
import {
  mutations as assignmentMutations,
  queries as assignmentQueries,
  types as assignmentTypes,
} from '@/loyalty/graphql/schemas/assignment';
import {
  mutations as assignmentCampaignMutations,
  queries as assignmentCampaignQueries,
  types as assignmentCampaignTypes,
} from '@/loyalty/graphql/schemas/assignmentCampaign';

import {
  mutations as scoreCampaignMutations,
  queries as scoreCampaignQueries,
  types as scoreCampaignTypes,
} from '@/loyalty/graphql/schemas/scoreCampaign';

import {
  mutations as couponCampaignMutations,
  queries as couponCampaignQueries,
  types as couponCampaignTypes,
} from '@/loyalty/graphql/schemas/couponCampaign';

import {
  mutations as couponMutations,
  queries as couponQueries,
  types as couponTypes,
} from '@/loyalty/graphql/schemas/coupon';

import {
  types as agentTypes,
  mutations as agentMutations,
  queries as agentQueries,
} from '@/loyalty/graphql/schemas/agents';
export const types = `
  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type SomeType {
    visibility: CacheControlScope
  }


    ${donateCampaignTypes}
    ${donateTypes}
    ${spinCampaignTypes}
    ${spinTypes}
    ${lotteryCampaignTypes}
    ${lotteryTypes}
    ${voucherCampaignTypes}
    ${voucherTypes}
    ${loyaltyTypes}
    ${configTypes}
    ${scoreLogTypes}
    ${assignmentTypes}
    ${assignmentCampaignTypes}
    ${scoreCampaignTypes}
    ${agentTypes}
    ${couponTypes}
    ${couponCampaignTypes}
`;

export const queries = `
   ${donateCampaignQueries}
      ${donateQueries}
      ${spinCampaignQueries}
      ${spinQueries}
      ${lotteryCampaignQueries}
      ${lotteryQueries}
      ${voucherCampaignQueries}
      ${voucherQueries}
      ${loyaltyQueries}
      ${configQueries}
      ${scoreLogQueries}
      ${assignmentQueries}
      ${assignmentCampaignQueries}
      ${scoreCampaignQueries}
      ${agentQueries}
      ${couponQueries}
      ${couponCampaignQueries}
`;

export const mutations = `
      ${donateCampaignMutations}
      ${donateMutations}
      ${spinCampaignMutations}
      ${spinMutations}
      ${lotteryCampaignMutations}
      ${lotteryMutations}
      ${voucherCampaignMutations}
      ${voucherMutations}
      ${loyaltyMutations}
      ${configMutations}
      ${ScoreLogMutations}
      ${assignmentMutations}
      ${assignmentCampaignMutations}
      ${scoreCampaignMutations}
      ${agentMutations}
      ${couponMutations}
      ${couponCampaignMutations}
`;

export default { types, queries, mutations };
