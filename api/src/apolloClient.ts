import { ApolloServer, gql, PlaygroundConfig } from 'apollo-server-express';
import { buildSubgraphSchema } from '@apollo/federation';
import * as dotenv from 'dotenv';
import {
  AutomationsAPI,
  EngagesAPI,
  HelpersApi,
  IntegrationsAPI
} from './data/dataSources';
import resolvers from './data/resolvers';
import * as typeDefDetails from './data/schema';
import { extendViaPlugins } from './pluginUtils';
import { IDataLoaders, generateAllDataLoaders } from './data/dataLoaders';

// load environment variables
dotenv.config();

const { NODE_ENV, USE_BRAND_RESTRICTIONS } = process.env;

let playground: PlaygroundConfig = false;

if (NODE_ENV !== 'production') {
  playground = {
    settings: {
      'general.betaUpdates': false,
      'editor.theme': 'dark',
      'editor.reuseHeaders': true,
      'tracing.hideTracingResponse': true,
      'editor.fontSize': 14,
      'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      'request.credentials': 'include'
    }
  };
}

const generateDataSources = () => {
  return {
    AutomationsAPI: new AutomationsAPI(),
    EngagesAPI: new EngagesAPI(),
    IntegrationsAPI: new IntegrationsAPI(),
    HelpersApi: new HelpersApi()
  };
};

let apolloServer;

export const initApolloServer = async app => {
  const { types, queries, mutations, subscriptions } = await extendViaPlugins(
    app,
    resolvers,
    typeDefDetails
  );

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
    dataSources: generateDataSources,
    playground,
    uploads: false,
    context: ({ req, res, connection }) => {
      let user = req && req.user ? req.user : null;

      const dataLoaders: IDataLoaders = generateAllDataLoaders();

      if (!req) {
        if (connection && connection.context && connection.context.user) {
          user = connection.context.user;
        }

        return {
          dataSources: generateDataSources(),
          dataLoaders,
          user
        };
      }

      const requestInfo = {
        secure: req.secure,
        cookies: req.cookies
      };

      if (USE_BRAND_RESTRICTIONS !== 'true') {
        return {
          brandIdSelector: {},
          singleBrandIdSelector: {},
          userBrandIdsSelector: {},
          docModifier: doc => doc,
          commonQuerySelector: {},
          user,
          res,
          requestInfo,
          dataLoaders
        };
      }

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

      return {
        brandIdSelector,
        singleBrandIdSelector,
        docModifier: doc => ({ ...doc, scopeBrandIds }),
        commonQuerySelector,
        commonQuerySelectorElk,
        userBrandIdsSelector,
        user,
        res,
        requestInfo,
        dataLoaders
      };
    }
  });

  return apolloServer;
};

export default apolloServer;
