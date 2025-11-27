import {
  types as cmsTypes,
  inputs as cmsInputs,
  queries as cmsQueries,
  mutations as cmsMutations,
} from '@/cms/graphql/schemas/cms';

export const types = `
    ${cmsTypes}
    ${cmsInputs}
  `;

export const queries = `
   ${cmsQueries}

  `;

export const mutations = `
    ${cmsMutations}
  `;

export default { types, queries, mutations };
