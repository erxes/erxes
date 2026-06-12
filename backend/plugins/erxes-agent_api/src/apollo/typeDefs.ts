import { apolloCommonTypes } from 'erxes-api-shared/utils';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { mutations, queries, types } from '~/apollo/schema/schema';

/** Assemble the plugin's federated GraphQL schema document. */
export const typeDefs = (): Promise<DocumentNode> =>
  Promise.resolve(gql`
    ${apolloCommonTypes}
    ${types}
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `);
