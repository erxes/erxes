import gql from 'graphql-tag';

import {
  types as IntegrationTypes,
  queries as IntegrationQueries,
  mutations as IntegrationMutations
} from './integrationTypeDefs';

const typeDefs = async _serviceDiscovery => {
  return gql`
    scalar JSON
    scalar Date

    ${IntegrationTypes}

    extend type Query {
      ${IntegrationQueries}
    }

    extend type Mutation {
      ${IntegrationMutations}
    }
  `;
};

export default typeDefs;
