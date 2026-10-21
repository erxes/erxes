import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginInlineTraceDisabled } from '@apollo/server/plugin/disabled';
import { ApolloServerPluginUsageReportingDisabled } from '@apollo/server/plugin/disabled';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as dotenv from 'dotenv';
import type { Express } from 'express';
import type { Server } from 'http';
import { IMainContext } from 'erxes-api-shared/core-types';
import {
  generateApolloContext,
  wrapApolloResolvers,
  expectedErrorPlugin,
} from 'erxes-api-shared/utils';
import { generateModels } from '../connectionResolvers';
import resolvers from './resolvers';
import { typeDefs } from './typeDefs';
import { credentialPrivacyPlugin } from './credentialPrivacy';

// load environment variables
dotenv.config();

export const initApolloServer = async (
  app: Express,
  httpServer: Server,
): Promise<ApolloServer> => {
  const apolloServer = new ApolloServer({
    // Parsed documents can contain inline vault values. Keep them out of the
    // process-wide document cache; ordinary resolver behavior is unchanged.
    documentStore: null,
    schema: buildSubgraphSchema([
      {
        typeDefs: await typeDefs(),
        resolvers: wrapApolloResolvers(resolvers),
      },
    ]),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      expectedErrorPlugin,
      credentialPrivacyPlugin,
      // A vault mutation may contain inline secrets, not only variables.
      ApolloServerPluginInlineTraceDisabled(),
      ApolloServerPluginUsageReportingDisabled(),
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
