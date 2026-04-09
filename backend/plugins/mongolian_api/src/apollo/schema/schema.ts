import {
  mutations as EbarimtMutations,
  queries as EbarimtQueries,
  types as EbarimtTypes,
} from '@/ebarimt/graphql/schemas';
import {
  mutations as ErkhetMutations,
  queries as ErkhetQueries,
  types as ErkhetTypes,
} from '@/erkhet/graphql/schemas';
import {
  mutations as ConfigMutations,
  queries as ConfigQueries,
  types as ConfigTypes,
} from '@/configs/graphql/schemas';
import {
  types as MsdynamicTypes,
  mutations as MsdynamicMutations,
  queries as MsdynamicQueries,
} from '@/msdynamic/graphql/schema/msdynamic';
import {
  mutations as ExchangeRateMutations,
  queries as ExchangeRateQueries,
  types as ExchangeRateTypes,
} from '@/exchangeRates/graphql/schemas';

export const types = `
  ${ConfigTypes}
  ${EbarimtTypes}
  ${ErkhetTypes}
  ${MsdynamicTypes}
  ${ExchangeRateTypes}
`;

export const queries = `
  ${ConfigQueries}
  ${EbarimtQueries}
  ${ErkhetQueries}
  ${MsdynamicQueries}
  ${ExchangeRateQueries}
`;

export const mutations = `
  ${ConfigMutations}
  ${EbarimtMutations}
  ${ErkhetMutations}
  ${MsdynamicMutations}
  ${ExchangeRateMutations}
`;

export default { types, queries, mutations };
