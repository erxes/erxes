import { gql } from 'apollo-server-express';
import {
  types as clientPortalTypes,
  queries as clientPortalQueries,
  mutations as clientPortalMutations
} from './schema/clientPortal';
import {
  types as clientPortalUserTypes,
  queries as clientPortalUserQueries,
  mutations as clientPortalUserMutations
} from './schema/clientPortalUser';

const typeDefs = async serviceDiscovery => {
  const contactsAvialable = await serviceDiscovery.isEnabled('contacts');

  return gql`
    scalar JSON
    scalar Date

    ${clientPortalTypes()}
    ${clientPortalUserTypes(contactsAvialable)}

    extend type Query {
     ${clientPortalQueries()}
     ${clientPortalUserQueries()}
    }

    extend type Mutation {
      ${clientPortalMutations()} 
      ${clientPortalUserMutations()}
    }
  `;
};

export default typeDefs;
