import { buildSubgraphSchema } from '@apollo/subgraph';
import * as dotenv from 'dotenv';
import resolvers from './data/resolvers';
import * as typeDefDetails from './data/schema';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolvers';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { gql } from 'graphql-tag';
// load environment variables
dotenv.config();

let apolloServer;

const { USE_BRAND_RESTRICTIONS } = process.env;

export const initApolloServer = async (app, httpServer) => {
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
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req, res }: any) => {
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

        let context;

        if (USE_BRAND_RESTRICTIONS !== 'true') {
          context = {
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
        } else {
          let scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || '[]');
          let brandIds = [];
          let brandIdSelector = {};
          let commonQuerySelector = {};
          let commonQuerySelectorElk;
          let userBrandIdsSelector = {};
          let singleBrandIdSelector = {};

          if (user) {
            brandIds = user.brandIds || [];

            if (scopeBrandIds.length === 0) {
              scopeBrandIds = brandIds;
            }

            if (!user.isOwner && scopeBrandIds.length > 0) {
              brandIdSelector = { _id: { $in: scopeBrandIds } };
              commonQuerySelector = { scopeBrandIds: { $in: scopeBrandIds } };
              commonQuerySelectorElk = { terms: { scopeBrandIds } };
              userBrandIdsSelector = { brandIds: { $in: scopeBrandIds } };
              singleBrandIdSelector = { brandId: { $in: scopeBrandIds } };
            }
          }

          context = {
            brandIdSelector,
            singleBrandIdSelector,
            userBrandIdsSelector,
            docModifier: doc => ({ ...doc, scopeBrandIds }),
            scopeBrandIds,
            commonQuerySelector,
            user,
            res,
            requestInfo,
            subdomain,
            models,
            commonQuerySelectorElk
          };
        }

        return context;
      }
    })
  );

  return apolloServer;
};

export default apolloServer;
