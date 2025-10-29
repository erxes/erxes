import {
  mutations as PricingMutations,
  queries as PricingQueries,
  types as PricingTypes,
} from '@/pricing/graphql/schemas/pricing';
import { TypeExtensions } from './extensions';

export const types = `
  ${TypeExtensions}
  ${PricingTypes}
`;

export const queries = `
  ${PricingQueries}
`;

export const mutations = `
  ${PricingMutations}
`;

export default { types, queries, mutations };
