import * as dotenv from 'dotenv';
dotenv.config();

import genTypeDefs from './genTypeDefs';

import { DocumentNode } from 'graphql';
import genResolvers from './genResolvers';

export default async function genTypeDefsAndResolvers(): Promise<{
  typeDefs: DocumentNode;
  resolvers: any;
} | null> {
  const typeDefs = genTypeDefs();
  const resolvers = genResolvers();

  return { typeDefs, resolvers };
}
