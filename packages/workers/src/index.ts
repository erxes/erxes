import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { filterXSS } from 'xss';
import { connect } from './db/connection';
import { initBroker } from './messageBroker';
import { join, leave, redis } from './serviceDiscovery';
import mongoose from 'mongoose';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { generateErrors } from './data/modules/import/generateErrors';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { readFileRequest } from './worker/export/utils';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import resolvers from './data/resolvers';
import typeDefDetails from './data/schema';
import { generateModels } from './connectionResolvers';
import gql from 'graphql-tag';
// load environment variables
dotenv.config();

async function closeMongooose() {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection disconnected');
  } catch (e) {
    console.error(e);
  }
}

async function leaveServiceDiscovery() {
  try {
    await leave('worker', PORT);
    console.log('Left from service discovery');
  } catch (e) {
    console.error(e);
  }
}

async function closeHttpServer() {
  try {
    await new Promise<void>((resolve, reject) => {
      // Stops the server from accepting new connections and finishes existing connections.
      httpServer.close((error: Error | undefined) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  } catch (e) {
    console.error(e);
  }
}

// load environment variables
dotenv.config();

const app = express();

app.disable('x-powered-by');

// for health check
app.get('/health', async (_req, res) => {
  res.end('ok');
});

app.get(
  '/download-import-error',
  routeErrorHandling(async (req: any, res) => {
    const { query } = req;

    const subdomain = getSubdomain(req);

    const { name, response } = await generateErrors(query, subdomain);

    res.attachment(`${name}.csv`);
    return res.send(response);
  })
);

app.get('/read-file', async (req: any, res: any) => {
  try {
    const key = req.query.key;

    const response = await readFileRequest({
      key
    });

    res.attachment(key);

    return res.send(response);
  } catch (e) {
    return console.error(e);
  }
});

app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

// Error handling middleware
app.use((error, _req, res, _next) => {
  console.error(error.stack);

  res.status(500).send(filterXSS(error.message));
});

const httpServer = createServer(app);

const {
  NODE_ENV,
  PORT = '3700',
  MONGO_URL = 'mongodb://localhost/erxes',
  RABBITMQ_HOST,
  MESSAGE_BROKER_PREFIX,
  TEST_MONGO_URL = 'mongodb://localhost/erxes-test',
  USE_BRAND_RESTRICTIONS
} = process.env;



let mongoUrl = MONGO_URL;

if (NODE_ENV === 'test') {
  mongoUrl = TEST_MONGO_URL;
}

// connect to mongo database
await connect(mongoUrl);

await initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis });

const { types, queries, mutations } = typeDefDetails;

const typeDefs = gql`
    ${types}
  
    extend type Query {
      ${queries}
    }
    extend type Mutation {
      ${mutations}
    }
  `;

const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([
    {
      typeDefs: typeDefs as any,
      resolvers
    }
  ]),
  // for graceful shutdowns
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await apolloServer.start();
console.log("apollo started")

app.use('/graphql', expressMiddleware(apolloServer, {
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
}));



await join({
  name: 'workers',
  port: PORT,
  dbConnectionString: MONGO_URL,
  hasSubscriptions: false,
  meta: {}
});

await new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
console.log(`GraphQL Server is now running on http://localhost:${PORT}/graphql`);

// If the Node process ends, close the http-server and mongoose.connection and leave service discovery.
(['SIGINT', 'SIGTERM'] as NodeJS.Signals[]).forEach(sig => {
  process.on(sig, async () => {
    await closeHttpServer();
    await closeMongooose();
    await leaveServiceDiscovery();
    process.exit(0);
  });
});
