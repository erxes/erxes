import gql from 'graphql-tag';

import { types as salesLogTypes } from './schema/salesplans';
import {
  types as yearPlanTypes,
  queries as yearPlanQueries,
  mutations as yearPlanMutations
} from './schema/yearPlans';
import {
  types as dayPlanTypes,
  queries as dayPlanQueries,
  mutations as dayPlanMutations
} from './schema/dayPlans';
import {
  types as timeProportionTypes,
  queries as timeProportionQueries,
  mutations as timeProportionMutations
} from './schema/timeProportions';
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
    ${dayPlanTypes()}
    ${timeProportionTypes()}
    ${dayLabelTypes()}
    ${settingsTypes}

    extend type Query {
      ${yearPlanQueries},
      ${dayPlanQueries},
      ${timeProportionQueries},
      ${dayLabelQueries},
      ${settingsQueries},
    }

    extend type Mutation {
      ${yearPlanMutations},
      ${dayPlanMutations},
      ${timeProportionMutations},
      ${dayLabelMutations},
      ${settingsMutations}
    }
  `;
};

export default typeDefs;
