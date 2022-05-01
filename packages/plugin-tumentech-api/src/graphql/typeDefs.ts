import { gql } from 'apollo-server-express';

import {
  types as tumentechTypes,
  queries as tumentechQueries,
  mutations as tumentechMutations
} from './schema/tumentech';

const typeDefs = async (serviceDiscovery) => {
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');

  const isEnabled = {
    contacts: isContactsEnabled
  };

  return gql`
    scalar JSON
    scalar Date
    
    ${tumentechTypes(isEnabled)}
    
    extend type Query {

      ${tumentechQueries}
    }
    
    extend type Mutation {
      ${tumentechMutations}
    }
  `;
};

export default typeDefs;
