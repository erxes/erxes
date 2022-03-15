import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { buildSubgraphSchema } from '@apollo/federation';
import * as dotenv from 'dotenv';
import resolvers from './data/resolvers';
import * as typeDefDetails from './data/schema';

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
    context: ({ req, res }) => {
      let user: any = null;

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
        requestInfo
      };
    }
  });

  await apolloServer.start();

  return apolloServer;
};

export default apolloServer;
