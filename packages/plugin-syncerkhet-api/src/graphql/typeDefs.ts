import { gql } from 'apollo-server-express';
import { mutations, types } from './schema/mutations';

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
  `;
};

export default typeDefs;
