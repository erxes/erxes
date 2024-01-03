import gql from 'graphql-tag';
import { mutations } from './schema/mutations';
import { queries } from './schema/queries';
import { types } from './schema/type';

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
    extend type Mutation {
      ${mutations}
    }

    extend type Query {
      ${queries}
    }
  `;
};

export default typeDefs;
