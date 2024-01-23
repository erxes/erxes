import gql from 'graphql-tag';

import {
  mutations as clientPortalMutations,
  queries as clientPortalQueries,
  types as clientPortalTypes,
} from './schema/clientPortal';
import {
  mutations as clientPortalUserMutations,
  queries as clientPortalUserQueries,
  types as clientPortalUserTypes,
} from './schema/clientPortalUser';
import {
  queries as notificationQueries,
  mutations as notificationMutations,
  types as notificationTypes,
} from './schema/clientPortalNotifications';

import {
  queries as commentQueries,
  types as commentTypes,
} from './schema/comment';

import {
  queries as fieldConfigQueries,
  types as fieldConfigTypes,
  mutations as fieldConfigMutations,
} from './schema/fieldConfigs';
import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const kbAvailable = isEnabled('knowledgebase');
  const cardAvailable = isEnabled('cards');
  const isContactsEnabled = isEnabled('contacts');
  const formsAvailable = isEnabled('forms');
  const productsAvailable = isEnabled('products');

  return gql`
    scalar JSON
    scalar Date

    ${clientPortalTypes(
      cardAvailable,
      kbAvailable,
      formsAvailable,
      productsAvailable,
    )}
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
