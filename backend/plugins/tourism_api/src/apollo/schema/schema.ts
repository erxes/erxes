import { TypeExtensions } from './extensions';
import {
  mutations as bmsMutations,
  queries as bmsQueries,
  types as bmsTypes,
} from '@/bms/graphql/schemas';

export const types = `
    ${TypeExtensions}
    ${bmsTypes}
  `;

export const queries = `
    ${bmsQueries}
  `;

export const mutations = `
    ${bmsMutations}
  `;

export default { types, queries, mutations };
