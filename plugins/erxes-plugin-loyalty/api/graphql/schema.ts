import { mutations as configMutations, queries as configQueries, types as configTypes } from './schema/config';
import { mutations as voucherCompaignMutations, queries as voucherCompaignQueries, types as voucherCompaignTypes } from './schema/voucherCompaign';
import { mutations as voucherMutations, queries as voucherQueries, types as voucherTypes } from './schema/voucher';
import { mutations as lotteryCompaignMutations, queries as lotteryCompaignQueries, types as lotteryCompaignTypes } from './schema/lotteryCompaign';
import { mutations as spinCompaignMutations, queries as spinCompaignQueries, types as spinCompaignTypes } from './schema/spinCompaign';
import { mutations as donateCompaignMutations, queries as donateCompaignQueries, types as donateCompaignTypes } from './schema/donateCompaign';
import { queries as loyaltyQueries, types as loyaltyTypes } from './schema/loyalty';

export const types = `
  ${configTypes}
  ${voucherCompaignTypes}
  ${lotteryCompaignTypes}
  ${spinCompaignTypes}
  ${donateCompaignTypes}
  ${loyaltyTypes}
  ${voucherTypes}
`;

export const queries = `
  ${configQueries}
  ${voucherCompaignQueries}
  ${lotteryCompaignQueries}
  ${spinCompaignQueries}
  ${donateCompaignQueries}
  ${loyaltyQueries}
  ${voucherQueries}
`;

export const mutations = `
  ${configMutations}
  ${voucherCompaignMutations}
  ${lotteryCompaignMutations}
  ${spinCompaignMutations}
  ${donateCompaignMutations}
  ${voucherMutations}
`;