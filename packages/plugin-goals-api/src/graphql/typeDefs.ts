import gql from 'graphql-tag';

import {
  types as GoalTypes,
  queries as GoalQueries,
  mutations as GoalMutations
} from './goalTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date

  ${GoalTypes}

  extend type Query {
    ${GoalQueries}
  }

  extend type Mutation {
    ${GoalMutations}
  }
`;

export default typeDefs;
