import gql from 'graphql-tag';

import {
  mutations as grantMutations,
  queries as grantQueries,
  types as grantTypes
} from './schema/grants';

const typeDefs = async serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    extend type User @key(fields: "_id") {
      _id: String! @external
      grantResponse:String
    }

    ${grantTypes}
    
    extend type Query {
      ${grantQueries}
    }
    
    extend type Mutation {
      ${grantMutations}
    }
  `;
};

export default typeDefs;
