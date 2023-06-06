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

import {
  queries as fieldConfigQueries,
  types as fieldConfigTypes,
  mutations as fieldConfigMutations
} from './schema/fieldConfigs';

const typeDefs = async serviceDiscovery => {
  const kbAvailable = await serviceDiscovery.isEnabled('knowledgebase');
  const cardAvailable = await serviceDiscovery.isEnabled('cards');
  const isContactsEnabled = await serviceDiscovery.isEnabled('contacts');
  const formsAvailable = await serviceDiscovery.isEnabled('forms');

  return gql`
    scalar JSON
    scalar Date

    ${clientPortalTypes(cardAvailable, kbAvailable, formsAvailable)}
    ${clientPortalUserTypes(isContactsEnabled)}
    ${notificationTypes}
    ${commentTypes}
    ${fieldConfigTypes}

    extend type Query {
     ${clientPortalQueries(cardAvailable, kbAvailable, formsAvailable)}
     ${clientPortalUserQueries()}
     ${notificationQueries}
     ${commentQueries}
     ${fieldConfigQueries}
    }

    extend type Mutation {
      ${clientPortalMutations(cardAvailable)} 
      ${clientPortalUserMutations()}
      ${notificationMutations}
      ${fieldConfigMutations}
    }
  `;
};

export default typeDefs;
