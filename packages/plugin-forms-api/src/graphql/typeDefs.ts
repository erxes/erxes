import { gql } from 'apollo-server-express';

import {
  fieldsTypes,
  fieldsQueries,
  fieldsMutations,
  fieldsGroupsTypes,
  fieldsGroupsQueries,
  fieldsGroupsMutations
} from './schema/field';

import {
  types,
  queries,
  mutations
} from './schema/form';

const typeDefs = async (_serviceDiscovery) => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    ${fieldsTypes}
    ${fieldsGroupsTypes}
    
    extend type Query {
      ${queries}
      ${fieldsQueries}
      ${fieldsGroupsQueries}
    }
    
    extend type Mutation {
      ${mutations}
      ${fieldsMutations}
      ${fieldsGroupsMutations}
    }
  `;
};

export default typeDefs;
