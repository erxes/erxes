import { gql } from 'apollo-server-express';

import {
  mutations as clientPortalMutations,
  queries as clientPortalQueries,
  types as clientPortalTypes
} from './schema/clientPortal';
import {
  mutations as clientPortalUserMutations,
  queries as clientPortalUserQueries,
  types as clientPortalUserTypes
} from './schema/clientPortalUser';
import {
  queries as notificationQueries,
  mutations as notificationMutations,
  types as notificationTypes
} from './schema/clientPortalNotifications';

const typeDefs = async serviceDiscovery => {
  const kbAvailable = await serviceDiscovery.isEnabled('knowledgebase');
  const cardAvailable = await serviceDiscovery.isEnabled('cards');
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');

  return gql`
    scalar JSON
    scalar Date

    ${clientPortalTypes(cardAvailable, kbAvailable)}
    ${clientPortalUserTypes(isContactsEnabled)}
    ${notificationTypes}

    extend type Query {
     ${clientPortalQueries(cardAvailable, kbAvailable)}
     ${clientPortalUserQueries()}
     ${notificationQueries}
    }

    extend type Mutation {
      ${clientPortalMutations(cardAvailable)} 
      ${clientPortalUserMutations()}
      ${notificationMutations}
    }
  `;
};

export default typeDefs;
