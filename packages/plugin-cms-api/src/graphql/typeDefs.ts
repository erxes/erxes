import gql from 'graphql-tag';
import {
  types as categoryTypes,
  inputs as categoryInputs,
  queries as categoryQueries,
  mutations as categoryMutations,
} from './schemas/category';

import {
  types as postTypes,
  inputs as postInputs,
  queries as postQueries,
  mutations as postMutations,
} from './schemas/post';

import {
  types as pageTypes,
  inputs as pageInputs,
  queries as pageQueries,
  mutations as pageMutations,
} from './schemas/page';

import {
  types as tagTypes,
  inputs as tagInputs,
  queries as tagQueries,
  mutations as tagMutations,
} from './schemas/tag';

import {
  types as menuTypes,
  inputs as menuInputs,
  queries as menuQueries,
  mutations as menuMutations,
} from './schemas/menu';

import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const isClientportalEnabled = await isEnabled('clientportal');

  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }
    
    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${
      isClientportalEnabled
        ? `
        extend type ClientPortalUser @key(fields: "_id") {
          _id: String! @external
        }

        extend type ClientPortal @key(fields: "_id") {
          _id: String! @external
        }
      `
        : ''
    }
    ${categoryTypes}
    ${postTypes}
    ${pageTypes}

    ${menuTypes}

    ${tagTypes}

    ${categoryInputs}
    ${postInputs}
    ${pageInputs}
    ${tagInputs}
    ${menuInputs}
    

    extend type Query {
      ${categoryQueries}
      ${postQueries}
      ${pageQueries}
      ${tagQueries}
      ${menuQueries}
    }
    
    extend type Mutation {
      ${categoryMutations}
      ${postMutations}
      ${pageMutations}
      ${tagMutations}
      ${menuMutations}
    }
  `;
};

export default typeDefs;
