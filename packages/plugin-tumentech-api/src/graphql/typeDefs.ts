import { gql } from 'apollo-server-express';

import {
  types as tumentechTypes,
  queries as tumentechQueries,
  mutations as tumentechMutations
} from './schema/tumentech';

const typeDefs = async (serviceDiscovery) => {
  const contactsEnabled = await serviceDiscovery.isEnabled('contacts');

  console.log(contactsEnabled);

  return gql`
    scalar JSON
    scalar Date
    
    ${await tumentechTypes(contactsEnabled)}
    
    extend type Query {

      ${tumentechQueries}
    }
    
    extend type Mutation {
      ${tumentechMutations}
    }
  `;
};

export default typeDefs;
