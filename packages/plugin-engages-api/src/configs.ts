import { filterXSS } from 'xss';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { connect } from './apiCollections';
import deliveryReports from './api/deliveryReports';
import telnyx from './api/telnyx';
import { trackEngages } from './trackers/engageTracker';
import { debugBase } from './debuggers';
import { initBroker } from './messageBroker';
import { IFetchElkArgs } from '@erxes/api-utils/src/types';

export let graphqlPubsub;

export let es: {
  client;
  fetchElk(args: IFetchElkArgs): Promise<any>;
  getMappings(index: string): Promise<any>;
  getIndexPrefix(): string;
};

export let debug;

export default {
  name: 'engages',
  graphql: {
    typeDefs,
    resolvers,
  },
  segment: { schemas: []},
  apolloServerContext: (context) => { context.dataloaders = {} },
  onServerInit: async (options) => {
    await connect();

    const app = options.app;

    app.disable('x-powered-by');

    app.use(cookieParser());

    trackEngages(app);

    // for health checking
    app.get('/health', async (_req, res) => {
      res.end('ok');
    });

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
    app.use('/deliveryReports', deliveryReports);
    app.use('/telnyx', telnyx);

    // Error handling middleware
    app.use((error, _req, res, _next) => {
      const msg = filterXSS(error.message);

      debugBase(`Error: ${msg}`);
      res.status(500).send(msg);
    });
    
    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
    es = options.elasticsearch;
  },
};
