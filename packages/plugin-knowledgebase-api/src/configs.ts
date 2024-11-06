import app from '@erxes/api-utils/src/app';
import { getEnv, getSubdomain } from '@erxes/api-utils/src/core';

import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as tmp from 'tmp';

import userMiddleware from '@erxes/api-utils/src/middlewares/user';
import * as multer from 'multer';
import automations from './automations';
import { generateModels } from './connectionResolver';
import cronjobs from './crons/article';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import logs from './logUtils';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import { checkPermission, handleUpload } from './utils';
import webhooks from './webhooks';
import templates from './templates';

export default {
  name: 'knowledgebase',
  graphql: () => {
    return {
      typeDefs,
      resolvers,
    };
  },
  hasSubscriptions: false,
  permissions,
  segment: {},
  meta: {
    logs: { consumers: logs },
    webhooks,
    permissions,
    cronjobs,
    automations,
    templates
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  middlewares: [cookieParser(), userMiddleware],

  onServerInit: async () => {
    app.use((req, _res, next) => {
      const DOMAIN = getEnv({ name: 'DOMAIN', defaultValue: 'http://localhost:3000' });
      const subdomain = getSubdomain(req);
      const domain = DOMAIN.replace('<subdomain>', subdomain);

      const corsOptions = {
        credentials: true,
        origin: domain,
      };

      cors(corsOptions)(req, _res, next);
    });

    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

    const tmpDir = tmp.dirSync({ unsafeCleanup: true });

    const upload = multer({
      dest: tmpDir.name,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
      fileFilter: (_req, file, cb) => {
        // Check the file type (MIME type)
        if (file.mimetype === 'application/pdf') {
          cb(null, true); // Accept the file
        } else {
          cb(new Error('Only PDF files are allowed!')); // Reject other file types
        }
      },
    });
    // app.post('/upload-pdf', uploader);

    app.post(
      '/upload-pdf',
      upload.single('file'),
      async (req: any, res, _next) => {
        if (!req.user) {
          return res.status(401).send('Unauthorized');
        }

        const subdomain = getSubdomain(req);

        try {
          await checkPermission(subdomain, req.user, 'manageKnowledgeBase');

          const { file } = req;

          if (!file) {
            return res.status(200).json({ error: 'File is required' });
          }

          try {
            const response = await handleUpload(subdomain, file);

            tmp.setGracefulCleanup();
            res.status(200).json({ success: true, ...response });
          } catch (e) {
            tmp.setGracefulCleanup();
            return res.status(200).json({ error: e.message });
          }
        } catch (e) {
          console.error(e.message);

          return res.status(200).json({ error: 'Something went wrong' });
        }
      }
    );
  },
  setupMessageConsumers,
};
