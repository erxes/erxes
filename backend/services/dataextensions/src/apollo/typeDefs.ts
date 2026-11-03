import { apolloCommonTypes } from 'erxes-api-shared/utils';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { mutations, queries, types } from '@/data-extensions/graphql/schemas';

export const typeDefs = async (): Promise<DocumentNode> =>
  gql(`
    ${apolloCommonTypes}
    ${types}
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `);
