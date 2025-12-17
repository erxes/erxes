import { TypeExtensions } from './extensions';
import {
  mutations as bmsMutations,
  queries as bmsQueries,
  types as bmsTypes,
} from '@/bms/graphql/schemas';

import {
  mutations as pmsMutations,
  queries as pmsQueries,
  types as pmsTypes,
} from '@/pms/graphql/schemas';

export const types = `
    ${TypeExtensions}
    ${bmsTypes}
    ${pmsTypes}
  `;

export const queries = `
    ${bmsQueries}
    ${pmsQueries}
  `;

export const mutations = `
    ${bmsMutations}
    ${pmsMutations}
  `;

export default { types, queries, mutations };
