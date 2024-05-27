import gql from 'graphql-tag';
import { queries, types } from './schema/queries';
import { mutations } from './schema/mutations';
import {
  queries as SafetyTipQueries,
  mutations as SafetyTipMutations,
  types as SafetyTipTypes,
} from './schema/safetyTips';

const typeDefs = async () => {
  return gql`
    scalar JSON
    scalar Date

    ${types}
    ${SafetyTipTypes}
    
    extend type Query {
      ${queries}
      ${SafetyTipQueries}
    }

    extend type Mutation {
      ${mutations}
      ${SafetyTipMutations}
    }
  `;
};

export default typeDefs;
