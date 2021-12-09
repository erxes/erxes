import { mutations as configMutations, queries as configQueries, types as configTypes } from './schema/config';
import { mutations as voucherCompaignMutations, queries as voucherCompaignQueries, types as voucherCompaignTypes } from './schema/voucherCompaign';
import { queries as loyaltyQueries, types as loyaltyTypes } from './schema/loyalty';

export const types = `
  ${configTypes}
  ${voucherCompaignTypes}
  ${loyaltyTypes}
`;

export const queries = `
  ${configQueries}
  ${voucherCompaignQueries}
  ${loyaltyQueries}
`;

export const mutations = `
  ${configMutations}
  ${voucherCompaignMutations}
`;