import { gql } from 'apollo-server-express';

import {
  types as ClientPortalTypes,
  queries as ClientPortalQueries,
  mutations as ClientPortalMutations,
} from './clientPortalTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date
  ${ClientPortalTypes}
  
  extend type Query {
    ${ClientPortalQueries}
  }

  extend type Mutation {
    ${ClientPortalMutations}
  }
`;

export default typeDefs;
