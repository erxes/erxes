import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import cronjobs from './cronjobs/bichil';
import { buildFile } from './reportExport';
import * as bodyParser from 'body-parser';
import * as multer from 'multer';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import userMiddleware, { checkPermission, handleUpload } from './utils';
import * as permissions from './permissions';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'bichil',
  permissions,

  meta: {
    cronjobs,
    permissions
  },

  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers
    };

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;

    return context;
  },

  middlewares: [cookieParser(), userMiddleware],

  onServerInit: async options => {
    mainDb = options.db;
    const app = options.app;

    const { DOMAIN } = process.env;

    const corsOptions = {
      credentials: true,
      origin: DOMAIN || 'http://localhost:3000'
    };

    app.use(cors(corsOptions));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get(
      '/bichil-report-export',
      routeErrorHandling(async (req: any, res) => {
        const { query } = req;

        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        const result = await buildFile(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      })
    );

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    const upload = multer({ dest: __dirname + '../uploads/' });

    app.post(
      '/upload-salary',
      upload.single('file'),
      async (req, res, _next) => {
        if (!req.user) {
          return res.status(401).send('Unauthorized');
        }

        const subdomain = getSubdomain(req);

        try {
          await checkPermission(subdomain, req.user, 'addSalaries');

          const file = req.file;
          const title = req.body.title || 'Untitled';

          if (!file) {
            return res.status(200).json({ error: 'File is required' });
          }

          try {
            const result = await handleUpload(subdomain, req.user, file, title);

            res.status(200).json({ success: true, result });
          } catch (e) {
            return res.status(200).json({ error: e.message });
          }
        } catch (e) {
          console.error(e.message);
          // next(e);
          return res.status(200).json({ error: e.message });
        }
      }
    );
  }
};
