import { gql } from 'apollo-server-express';

import {
  types as KnowledgeBaseTypes,
  queries as KnowledgeBaseQueries,
  mutations as KnowledgeBaseMutations,
} from './knowledgeBaseTypeDefs';

const typeDefs = gql`
  scalar JSON
  scalar Date
  ${KnowledgeBaseTypes}
  
  extend type Query {
    ${KnowledgeBaseQueries}
  }

  extend type Mutation {
    ${KnowledgeBaseMutations}
  }
`;

export default typeDefs;
