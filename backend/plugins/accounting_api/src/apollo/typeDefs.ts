import { apolloCommonTypes } from 'erxes-api-shared/utils';
import { DocumentNode } from 'graphql';
import { gql } from 'graphql-tag';
import { mutations, queries, types } from './schema/schema';

export const typeDefs = async (): Promise<DocumentNode> => {
  return gql(`
    directive @cacheControl(
    maxAge: Int
    scope: CacheControlScope
    inheritMaxAge: Boolean
  ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
  
    ${apolloCommonTypes}
    ${types}
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `);
};
