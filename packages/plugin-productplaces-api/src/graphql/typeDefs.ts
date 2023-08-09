import { gql } from 'apollo-server-express';

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

    type ProductPlacesResponse {
      content: JSON
      responseId: String
      userId: String
      sessionCode: String
    }
  `;
};

export default typeDefs;
