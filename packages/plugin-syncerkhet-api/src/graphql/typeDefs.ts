import gql from 'graphql-tag';
import { mutations } from './schema/mutations';
import { queries } from './schema/queries';
import { types } from './schema/type';
import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes
} from './schema/configs';

const typeDefs = async _serviceDiscovery => {
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

    ${types}
    ${configTypes}

    extend type Mutation {
      ${mutations}
      ${configMutations}
    }

    extend type Query {
      ${queries}
      ${configQueries}
    }
  `;
};

export default typeDefs;
