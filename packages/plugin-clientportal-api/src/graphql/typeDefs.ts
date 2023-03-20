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

import {
  queries as commentQueries,
  types as commentTypes
} from './schema/comment';

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
    ${commentTypes}

    extend type Query {
     ${clientPortalQueries(cardAvailable, kbAvailable)}
     ${clientPortalUserQueries()}
     ${notificationQueries}
     ${commentQueries}
    }

    extend type Mutation {
      ${clientPortalMutations(cardAvailable)} 
      ${clientPortalUserMutations()}
      ${notificationMutations}
    }
  `;
};

export default typeDefs;
