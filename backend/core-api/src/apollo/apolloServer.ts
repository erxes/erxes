import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as dotenv from 'dotenv';
import { IMainContext } from 'erxes-api-shared/core-types';
import {
  generateApolloContext,
  wrapApolloResolvers,
  expectedErrorPlugin,
} from 'erxes-api-shared/utils';
import { generateModels } from '../connectionResolvers';
import resolvers from './resolvers';
import { typeDefs } from './typeDefs';

// load environment variables
dotenv.config();

let apolloServer;

export const initApolloServer = async (app, httpServer) => {
  apolloServer = new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs: await typeDefs(),
        resolvers: wrapApolloResolvers(resolvers),
      },
    ]),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      expectedErrorPlugin,
    ],
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: generateApolloContext<IMainContext>(
        async (subdomain, context) => {
          const models = await generateModels(subdomain, context);

          context.models = models;

          return context;
        },
      ),
    }),
  );

  return apolloServer;
};

export default apolloServer;
