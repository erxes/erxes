import { gql } from 'apollo-server-express';

import {
  mutations as DashboardMutations,
  queries as DashboardQueries,
  types as DashboardTypes
} from './dashboardTypeDefs';

const typeDefs = async serviceDiscovery => {
  const tagsAvailable = await serviceDiscovery.isEnabled('tags');

  return gql`
  scalar JSON
  scalar Date
  
  ${DashboardTypes(tagsAvailable)}
  
  extend type Query {
    ${DashboardQueries}
  }
  
  extend type Mutation {
    ${DashboardMutations}
  }
  `;
};

export default typeDefs;
