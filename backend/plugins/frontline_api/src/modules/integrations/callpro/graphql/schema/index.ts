import {
  mutations as CallProMutations,
  queries as CallProQueries,
  types as CallProTypes,
} from './callpro';

export const types = `
    ${CallProTypes}
  `;

export const queries = `
    ${CallProQueries}
  `;

export const mutations = `
    ${CallProMutations}
  `;
