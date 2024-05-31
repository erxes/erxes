import gql from 'graphql-tag';

import {
  mutations as configMutations,
  queries as configQueries,
  types as configTypes
} from './schema/configs';

// import {
//   queries as accountQueries,
//   types as accountTypes
// } from './schema/accounts';



const typeDefs = async () => {
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

    extend type User @key(fields: "_id") {
      _id: String! @external
    }
    
    ${configTypes}

    extend type Query {
      ${configQueries}
    }
    
    extend type Mutation {
      ${configMutations}
    }
  `;
};

export default typeDefs;
