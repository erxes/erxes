import gql from "graphql-tag";

import {
  mutations as clientPortalMutations,
  queries as clientPortalQueries,
  types as clientPortalTypes
} from "./schema/clientPortal";
import {
  mutations as clientPortalUserMutations,
  queries as clientPortalUserQueries,
  types as clientPortalUserTypes
} from "./schema/clientPortalUser";
import {
  queries as notificationQueries,
  mutations as notificationMutations,
  types as notificationTypes
} from "./schema/clientPortalNotifications";

import {
  queries as commentQueries,
  types as commentTypes
} from "./schema/comment";

import {
  queries as fieldConfigQueries,
  types as fieldConfigTypes,
  mutations as fieldConfigMutations,
} from './schema/fieldConfigs';

import {
  queries as vercelQueries,
  mutations as vercelMutations,
} from './schema/vercel';

import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';

const typeDefs = async () => {
  const kbAvailable = isEnabled("knowledgebase");
  const cmsAvailable = await isEnabled("cms");

  const salesAvailable = isEnabled("sales");
  const ticketsAvailable = isEnabled("tickets");
  const tasksAvailable = isEnabled("tasks");
  const purchasesAvailable = isEnabled("purchases");
  const enabledPlugins = {
    sales: salesAvailable,
    tickets: ticketsAvailable,
    tasks: tasksAvailable,
    purchases: purchasesAvailable,
    knowledgebase: kbAvailable,
    cms: cmsAvailable
  };

  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }
    
    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${
      cmsAvailable
        ? `
        extend type Post @key(fields: "_id") {
          _id: String! @external
        }
      `
        : ``
    }

    ${clientPortalTypes(enabledPlugins)}
    ${clientPortalUserTypes(enabledPlugins)}
    ${notificationTypes}
    ${commentTypes}
    ${fieldConfigTypes}

    extend type Query {
     ${clientPortalQueries(enabledPlugins)}
     ${clientPortalUserQueries(cmsAvailable)}
     ${notificationQueries}
     ${commentQueries}
     ${fieldConfigQueries}
     ${vercelQueries}
    }

    extend type Mutation {
      ${clientPortalMutations} 
      ${clientPortalUserMutations(cmsAvailable)}
      ${notificationMutations}
      ${fieldConfigMutations}
      ${vercelMutations}
    }
  `;
};

export default typeDefs;
