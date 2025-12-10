import {
  types as cmsTypes,
  inputs as cmsInputs,
  queries as cmsQueries,
  mutations as cmsMutations,
} from '@/cms/graphql/schemas/cms';

import {
  types as postTypes,
  inputs as postInputs,
  queries as postQueries,
  mutations as postMutations,
} from '@/cms/graphql/schemas/posts';

import {
  types as customPostTypeTypes,
  inputs as customPostTypeInputs,
  queries as customPostTypeQueries,
  mutations as customPostTypeMutations,
} from '@/cms/graphql/schemas/customPostType';

import {
  types as categoryTypes,
  inputs as categoryInputs,
  queries as categoryQueries,
  mutations as categoryMutations,
} from '@/cms/graphql/schemas/category';

import {
  types as tagTypes,
  inputs as tagInputs,
  queries as tagQueries,
  mutations as tagMutations,
} from '@/cms/graphql/schemas/tag';

export const types = `

  enum CacheControlScope {
    PUBLIC
    PRIVATE
  }
  
  directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

  type SomeType {
    visibility: CacheControlScope
  }


  extend type User @key(fields: "_id") {
    _id: String @external
  }

    ${cmsTypes}
    ${cmsInputs}
    ${postTypes}
    ${postInputs}
    ${customPostTypeTypes}
    ${customPostTypeInputs}
    ${categoryTypes}
    ${categoryInputs}
    ${tagTypes}
    ${tagInputs}
      `;

export const queries = `
   ${cmsQueries}

    ${postQueries}

    ${customPostTypeQueries}

    ${categoryQueries}

    ${tagQueries}

  `;

export const mutations = `
    ${cmsMutations}
    ${postMutations}
    ${customPostTypeMutations}
    ${categoryMutations}
    ${tagMutations}
  `;

export default { types, queries, mutations };
