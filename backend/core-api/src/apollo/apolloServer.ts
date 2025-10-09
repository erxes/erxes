import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as dotenv from 'dotenv';
import {
  generateApolloContext,
  apolloCommonTypes,
  wrapApolloMutations,
} from 'erxes-api-shared/utils';
import { gql } from 'graphql-tag';
import { generateModels } from '../connectionResolvers';
import resolvers from './resolvers';
import { IMainContext } from 'erxes-api-shared/core-types';

import * as typeDefDetails from './schema/schema';
// load environment variables
dotenv.config();

class ApolloServerInstance {
  private static instance: ApolloServer | null = null;

  static getInstance(): ApolloServer | null {
    return this.instance;
  }

  static setInstance(server: ApolloServer): void {
    this.instance = server;
  }
}

export const initApolloServer = async (app, httpServer) => {
  const { types, queries, mutations } = typeDefDetails;

  const typeDefs = async () => {
    return gql(`

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

  ApolloServerInstance.setInstance(
    new ApolloServer({
      schema: buildSubgraphSchema([
        {
          typeDefs: await typeDefs(),
          resolvers: {
            ...resolvers,
            Mutation: wrapApolloMutations(resolvers?.Mutation || {}, ['login']),
          },
        },
      ]),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    }),
  );

  const apolloServer = ApolloServerInstance.getInstance();
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: generateApolloContext<IMainContext>(
        async (subdomain, context) => {
          const models = await generateModels(subdomain);

          context.models = models;

          return context;
        },
      ),
    }),
  );

  return apolloServer;
};

export default ApolloServerInstance.getInstance();
