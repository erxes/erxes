import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as dotenv from 'dotenv';
import { IMainContext } from 'erxes-api-shared/core-types';
import {
  apolloCommonTypes,
  generateApolloContext,
  wrapApolloResolvers,
} from 'erxes-api-shared/utils';
import { gql } from 'graphql-tag';
import { generateModels } from '../connectionResolvers';
import resolvers from './resolvers';

import * as typeDefDetails from './schema/schema';
// load environment variables
dotenv.config();

let apolloServer;

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

  apolloServer = new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs: await typeDefs(),
        resolvers: wrapApolloResolvers(resolvers),
      },
    ]),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

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

export default apolloServer;
