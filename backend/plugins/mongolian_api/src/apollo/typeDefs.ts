import { apolloCommonTypes } from 'erxes-api-shared/utils';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { mutations, queries, types } from '~/apollo/schema/schema';

export const typeDefs = async (): Promise<DocumentNode> => {
  return gql`
    ${apolloCommonTypes}
    ${types}
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `;
};
