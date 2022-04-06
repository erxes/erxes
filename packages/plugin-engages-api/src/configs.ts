import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import { IFetchElkArgs } from '@erxes/api-utils/src/types';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers/index';
import telnyx from './api/telnyx';
import { trackEngages } from './trackers/engageTracker';
import { initBroker } from './messageBroker';
import { generateModels } from './connectionResolver';
import tags from './tags';
import logs from './logUtils';

export let graphqlPubsub;
export let serviceDiscovery;
export let mainDb;
export let debug;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export default {
  name: 'engages',
  graphql: async (sd) => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers,
    }
  },
  segment: { schemas: [] },
  hasSubscriptions: false,
  meta: { tags, logs: { consumers: logs } },
  apolloServerContext: async (context) => {
    const subdomain = 'os';

    context.dataloaders = {};
    context.docModifier = (doc) => doc;

    context.models = await generateModels(subdomain);
    context.subdomain = subdomain;

    return context;
  },
  onServerInit: async (options) => {
    mainDb = options.db;

    const app = options.app;

    app.disable('x-powered-by');

    app.use(cookieParser());

    trackEngages(app);

    app.use((req: any, _res, next) => {
      req.rawBody = '';

      req.on('data', (chunk) => {
        req.rawBody += chunk.toString();
      });

      next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Insert routes below
    app.use('/telnyx', telnyx);

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
