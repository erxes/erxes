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
  const tagsAvailable = await serviceDiscovery.isAvailable('tags');

  return gql`
    scalar JSON
    scalar Date

    ${customerTypes(tagsAvailable)}
    ${companyTypes(tagsAvailable)}
    
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