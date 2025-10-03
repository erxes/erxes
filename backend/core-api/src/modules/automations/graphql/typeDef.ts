import gql from 'graphql-tag';
import {
  types as mainTypes,
  queries as mainQueries,
  mutations as mainMutations,
} from './schema';
import { DocumentNode } from 'graphql';

const types = `
  scalar JSON
  scalar Date

  enum CURSOR_DIRECTION {
    forward,
    backward
  }

  type PageInfo {
    hasNextPage: Boolean,
    hasPreviousPage: Boolean,
    startCursor: String,
    endCursor: String,
  }

  ${mainTypes}

`;

const queries = `
  type Query {
      ${mainQueries}
    }
`;

const mutations = `
  type Mutation {
      ${mainMutations}
    }
`;

const typeDefs = async (): Promise<DocumentNode> => {
  return gql(`
      ${types} ${queries} ${mutations}
    `);
};

export default typeDefs;
