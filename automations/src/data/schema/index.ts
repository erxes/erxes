import { gql } from 'apollo-server-express';

import {
  mutations as AutomationMutations,
  queries as AutomationQueries,
  types as AutomationTypes,
} from './automations';

export const types = `
  scalar JSON
  scalar Date
  ${AutomationTypes}
`;

export const queries = `
  type Query {
    ${AutomationQueries}
  }
`;

export const mutations = `
  type Mutation {
    ${AutomationMutations}
  }
`;

export const subscriptions = ``;

const typeDefs = gql(`${types} ${queries} ${mutations} ${subscriptions}`);

export default typeDefs;
