import {
  inputs as cmsInputs,
  mutations as cmsMutations,
  queries as cmsQueries,
  types as cmsTypes,
} from '@/cms/graphql/schemas/cms';

import {
  inputs as postInputs,
  mutations as postMutations,
  queries as postQueries,
  types as postTypes,
} from '@/cms/graphql/schemas/posts';

import {
  inputs as customPostTypeInputs,
  mutations as customPostTypeMutations,
  queries as customPostTypeQueries,
  types as customPostTypeTypes,
} from '@/cms/graphql/schemas/customPostType';

import {
  inputs as categoryInputs,
  mutations as categoryMutations,
  queries as categoryQueries,
  types as categoryTypes,
} from '@/cms/graphql/schemas/category';

import {
  inputs as tagInputs,
  mutations as tagMutations,
  queries as tagQueries,
  types as tagTypes,
} from '@/cms/graphql/schemas/tag';

import {
  inputs as menuInputs,
  mutations as menuMutations,
  queries as menuQueries,
  types as menuTypes,
} from '@/cms/graphql/schemas/menu';

import {
  inputs as pageInputs,
  mutations as pageMutations,
  queries as pageQueries,
  types as pageTypes,
} from '@/cms/graphql/schemas/page';

import {
  inputs as webInputs,
  mutations as webMutations,
  queries as webQueries,
  types as webTypes,
} from '@/webbuilder/graphql/schemas/web';


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

    ${webTypes}
    ${webInputs}
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
    ${menuTypes}
    ${menuInputs}
    ${pageTypes}
    ${pageInputs}
`;

export const queries = `
    ${webQueries}
    ${cmsQueries}
    ${postQueries}
    ${customPostTypeQueries}
    ${categoryQueries}
    ${tagQueries}
    ${menuQueries}
    ${pageQueries}
  `;

export const mutations = `
    ${webMutations}
    ${cmsMutations}
    ${postMutations}
    ${customPostTypeMutations}
    ${categoryMutations}
    ${tagMutations}
    ${menuMutations}
    ${pageMutations}
`;

export default { types, queries, mutations };
