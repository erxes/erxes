import { gql } from 'apollo-server-express';

import {
  types as customerTypes,
  queries as CustomerQueries,
  mutations as CustomerMutations
} from './customer';

import {
  types as companyTypes,
  queries as CompanyQueries,
  mutations as CompanyMutations
} from './company';

const typeDefs = async (serviceDiscovery) =>  {
  const tagsEnabled = await serviceDiscovery.isEnabled('tags');
  const inboxEnabled = await serviceDiscovery.isEnabled('inbox');

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
  
    ${
      tagsEnabled ? 
      `
        extend type Tag @key(fields: "_id") {
          _id: String! @external
        }
      ` : ''
    }

    ${
      inboxEnabled ? 
      `
        extend type Integration @key(fields: "_id") {
          _id: String! @external
        }
      ` : ''
    }


    ${customerTypes(tagsEnabled, inboxEnabled)}
    ${companyTypes(tagsEnabled)}
    
    extend type Query {
      ${CustomerQueries}
      ${CompanyQueries}
    }

    extend type Mutation {
      ${CustomerMutations}
      ${CompanyMutations}
    }
  `;
}

export default typeDefs;