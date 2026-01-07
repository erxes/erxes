import {
  mutations as PricingMutations,
  queries as PricingQueries,
  types as PricingTypes,
} from '@/pricing/graphql/schemas/pricing';
import {
  mutations as ScoreMutations,
  queries as ScoreQueries,
  types as ScoreTypes,
} from '@/score/graphql/schemas/score';
import { TypeExtensions } from './extensions';

export const types = `
  ${TypeExtensions}
  ${PricingTypes}
  ${ScoreTypes}
  
`;

export const queries = `
  ${PricingQueries}
  ${ScoreQueries}
`;

export const mutations = `
  ${PricingMutations}
  ${ScoreMutations}
`;

export default { types, queries, mutations };
