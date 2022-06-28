import { attachmentInput, attachmentType } from '@erxes/api-utils/src/commonTypeDefs';
import { gql } from 'apollo-server-express';
import { mutations as donateCampaignMutations, queries as donateCampaignQueries, types as donateCampaignTypes } from './schema/donateCampaign';
import { mutations as donateMutations, queries as donateQueries, types as donateTypes } from './schema/donate';
import { mutations as spinCampaignMutations, queries as spinCampaignQueries, types as spinCampaignTypes } from './schema/spinCampaign';
import { mutations as spinMutations, queries as spinQueries, types as spinTypes } from './schema/spin';
import { mutations as lotteryCampaignMutations, queries as lotteryCampaignQueries, types as lotteryCampaignTypes } from './schema/lotteryCampaign';
import { mutations as lotteryMutations, queries as lotteryQueries, types as lotteryTypes } from './schema/lottery';
import { mutations as voucherCampaignMutations, queries as voucherCampaignQueries, types as voucherCampaignTypes } from './schema/voucherCampaign';
import { mutations as voucherMutations, queries as voucherQueries, types as voucherTypes } from './schema/voucher';
import { mutations as loyaltyMutations, queries as loyaltyQueries, types as loyaltyTypes } from './schema/loyalty';
import { mutations as configMutations, queries as configQueries, types as configTypes } from './schema/config';
import { mutation as ScoreLogMutations,  queries as scoreLogQueries, types as scoreLogTypes } from './schema/scoreLog';

const typeDefs = async (_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${attachmentType}
    ${attachmentInput}

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

    extend type Query {
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
    }

    extend type Mutation {
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
    }
  `;
};

export default typeDefs;
