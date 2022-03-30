import { gql } from 'apollo-server-express';

import {
  types as exmTypes,
  queries as exmQueries,
  mutations as exmMutations,
} from './schema/exmFeed';

const typeDefs = async (serviceDiscovery) => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');

  const isEnabled = {
    contacts: isContactsEnabled,
  };

  return gql`
    scalar JSON
    scalar Date
    
    ${exmTypes(isEnabled)}
    
    extend type Query {

      ${exmQueries}
    }
    
    extend type Mutation {
      ${exmMutations}
    }
  `;
};
export default typeDefs;
