import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import * as dotenv from 'dotenv';
import {
  apolloCommonTypes,
  extractUserFromHeader,
  getSubdomain,
} from 'erxes-api-shared/utils';

import { gql } from 'graphql-tag';
import { generateModels } from '~/connectionResolvers';
import * as typeDefDetails from './schema/schema';
import resolvers from './resolvers';

// load environment variables
dotenv.config();

let apolloServer;

export const initApolloServer = async (app, httpServer) => {
  const { types } = typeDefDetails;

  const typeDefs = async () => {
    return gql(`
      ${types}
      ${apolloCommonTypes}
    `);
  };

  apolloServer = new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs: await typeDefs(),
        resolvers,
      },
    ]),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => {
        if (
          req.body.operationName === 'IntrospectionQuery' ||
          req.body.operationName === 'SubgraphIntrospectQuery'
        ) {
          return {};
        }
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const user: any = extractUserFromHeader(req.headers);

        const requestInfo = {
          secure: req.secure,
          cookies: req.cookies,
        };

        return {
          user,
          res,
          requestInfo,
          subdomain,
          models,
        };
      },
    }),
  );

  return apolloServer;
};

export default apolloServer;
