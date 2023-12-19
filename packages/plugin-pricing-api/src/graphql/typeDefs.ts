import gql from 'graphql-tag';

import {
  types as pricingPlanTypes,
  queries as pricingPlanQueries,
  mutations as pricingPlanMutations
} from './schema/pricingPlan';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int,
      scope: CacheControlScope,
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    ${pricingPlanTypes()}
    
    extend type Query {
      ${pricingPlanQueries}
    }
    
    extend type Mutation {
      ${pricingPlanMutations}
    }
  `;
};

export default typeDefs;
