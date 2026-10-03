import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import {
  mutations as changemoduleMutations,
  queries as changemoduleQueries,
  types as changemoduleTypes,
} from '../modules/changemodule/graphql/schemas/changemoduleItems';

export const typeDefs = async (): Promise<DocumentNode> => {
  return gql`
    scalar JSON
    scalar Date

    ${changemoduleTypes}

    extend type Query {
      ${changemoduleQueries}
    }

    extend type Mutation {
      ${changemoduleMutations}
    }
  `;
};
