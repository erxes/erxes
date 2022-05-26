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
  const kbAvailable = await serviceDiscovery.isEnabled('knowledgebase');
  const cardAvailable = await serviceDiscovery.isEnabled('cards');

  return gql`
    scalar JSON
    scalar Date

    ${clientPortalTypes(cardAvailable, kbAvailable)}
    ${clientPortalUserTypes()}

    extend type Query {
     ${clientPortalQueries(cardAvailable, kbAvailable)}
     ${clientPortalUserQueries()}
    }

    extend type Mutation {
      ${clientPortalMutations(cardAvailable)} 
      ${clientPortalUserMutations()}
    }
  `;
};

export default typeDefs;
