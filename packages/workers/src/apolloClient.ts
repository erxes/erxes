import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { buildSubgraphSchema } from '@apollo/federation';
import * as dotenv from 'dotenv';
import resolvers from './data/resolvers';
import * as typeDefDetails from './data/schema';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolvers';

// load environment variables
dotenv.config();

let apolloServer;

export const initApolloServer = async (_app, httpServer) => {
  const { types, queries, mutations } = typeDefDetails;

  const typeDefs = gql(`
    ${types}
  
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `);

  apolloServer = new ApolloServer({
    schema: buildSubgraphSchema([
      {
        typeDefs,
        resolvers
      }
    ]),
    // for graceful shutdowns
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: async ({ req, res }) => {
      let user: any = null;

      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      if (req.headers.user) {
        const userJson = Buffer.from(req.headers.user, 'base64').toString(
          'utf-8'
        );
        user = JSON.parse(userJson);
      }

      const requestInfo = {
        secure: req.secure,
        cookies: req.cookies
      };

      return {
        brandIdSelector: {},
        singleBrandIdSelector: {},
        userBrandIdsSelector: {},
        docModifier: doc => doc,
        commonQuerySelector: {},
        user,
        res,
        requestInfo,
        subdomain,
        models
      };
    }
  });

  await apolloServer.start();

  return apolloServer;
};

export default apolloServer;
