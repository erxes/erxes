import { gql } from 'apollo-server-express';

import {
  types as salesLogTypes,
  queries as salesLogQueries,
  mutations as salesLogMutations
} from './schema/salesplans';
import {
  types as yearPlanTypes,
  queries as yearPlanQueries,
  mutations as yearPlanMutations
} from './schema/yearPlans';
import {
  types as dayLabelTypes,
  queries as dayLabelQueries,
  mutations as dayLabelMutations
} from './schema/dayLabels';

import {
  types as settingsTypes,
  queries as settingsQueries,
  mutations as settingsMutations
} from './schema/settings';

const typeDefs = async () => {
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

    ${salesLogTypes()}
    ${yearPlanTypes()}
    ${dayLabelTypes()}
    ${settingsTypes}

    extend type Query {
      ${salesLogQueries},
      ${yearPlanQueries},
      ${dayLabelQueries},
      ${settingsQueries},
    }

    extend type Mutation {
      ${salesLogMutations},
      ${yearPlanMutations},
      ${dayLabelMutations},
      ${settingsMutations}
    }
  `;
};

export default typeDefs;
