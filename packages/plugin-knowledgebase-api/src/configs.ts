import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';

import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as multer from 'multer';
import * as tmp from 'tmp';

import automations from './automations';
import { generateModels } from './connectionResolver';
import cronjobs from './crons/article';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import logs from './logUtils';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import userMiddleware, { checkPermission, handleUpload } from './utils';
import webhooks from './webhooks';

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
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  middlewares: [cookieParser(), userMiddleware],

  onServerInit: async () => {
    const { DOMAIN } = process.env;

    const corsOptions = {
      credentials: true,
      origin: DOMAIN || 'http://localhost:3000',
    };

    app.use(cors(corsOptions));

    const tmpDir = tmp.dirSync({ unsafeCleanup: true });
    const upload = multer({
      dest: tmpDir.name,
      limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
      fileFilter: (req, file, cb) => {
        // Check the file type (MIME type)
        if (file.mimetype === 'application/pdf') {
          cb(null, true); // Accept the file
        } else {
          cb(new Error('Only PDF files are allowed!')); // Reject other file types
        }
      },
    });

    app.post(
      '/upload-pdf',
      upload.single('file'),
      async (req: any, res, _next) => {
        if (!req.user) {
          return res.status(401).send('Unauthorized');
        }

        const subdomain = getSubdomain(req);

        try {
          await checkPermission(subdomain, req.user, 'knowledgeBaseArticlesAdd');
          await checkPermission(subdomain, req.user, 'knowledgeBaseArticlesEdit');

          const file = req.file;

          if (!file) {
            return res.status(200).json({ error: 'File is required' });
          }

          try {
            const message = await handleUpload(subdomain, req.user, file);

            tmp.setGracefulCleanup();
            res.status(200).json({ success: true, message });
          } catch (e) {
            tmp.setGracefulCleanup();
            return res.status(200).json({ error: e.message });
          }
        } catch (e) {
          console.error(e.message);
          // next(e);
          return res.status(200).json({ error: e.message });
        }
      }
    );
  },
  setupMessageConsumers,
};
