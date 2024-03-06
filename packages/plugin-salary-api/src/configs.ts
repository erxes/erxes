import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import { setupMessageConsumers } from './messageBroker';

import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as multer from 'multer';
import { generateModels } from './connectionResolver';
import * as permissions from './permissions';
import userMiddleware, { checkPermission, handleUpload } from './utils';

export default {
  name: 'salary',
  permissions,

  meta: {
    permissions,
  },

  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const requestInfo = {
      secure: req.secure,
      cookies: req.cookies,
      headers: req.headers,
    };

    context.subdomain = subdomain;
    context.models = models;

    context.requestInfo = requestInfo;
    context.res = res;

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

    const upload = multer({ dest: __dirname + '../uploads/' });

    app.post(
      '/upload-salary',
      upload.single('file'),
      async (req: any, res, _next) => {
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
      },
    );
  },
  setupMessageConsumers,
};
