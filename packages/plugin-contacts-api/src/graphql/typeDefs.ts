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
  const tagsEnabled = serviceDiscovery.isEnabled('tags');
  const inboxEnabled = serviceDiscovery.isEnabled('inbox');

  console.log({ tagsEnabled, inboxEnabled });

  return gql`
    scalar JSON
    scalar Date
      
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