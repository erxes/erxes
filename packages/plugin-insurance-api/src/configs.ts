import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';

import app from '@erxes/api-utils/src/app';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';
import { generateModels } from './connectionResolver';
import documents from './documents';
import forms from './forms';
import userMiddleware, { buildFile, buildFileMain } from './graphql/resolvers/utils';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import payment from './payment';
import tags from './tags';
import * as chromium from 'download-chromium';
import redis from '@erxes/api-utils/src/redis';

export default {
  name: 'insurance',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  meta: {
    forms,
    documents,
    payment,
    tags,
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    if (req.cpUser) {
      context.cpUser = req.cpUser;
    }

    return context;
  },
  middlewares: [cookieParser(), cpUserMiddleware, userMiddleware],

  onServerInit: async () => {
    app.get('/export', async (req: any, res) => {
      const { cpUser, user } = req;
      console.log('user', user);
      if (!cpUser && !user) {
        return res.status(401).send('Unauthorized');
      }

      const { query } = req;

      const subdomain = getSubdomain(req);

      const models = await generateModels(subdomain);

      if (user) {
        const result = await buildFileMain(models, subdomain, query);

        res.attachment(`${result.name}.xlsx`);

        return res.send(result.response);
      }

      const result = await buildFile(models, subdomain, cpUser, query);

      res.attachment(`${result.name}.xlsx`);

      // download chromium

    

      return res.send(result.response);
    });

    const execPath = await chromium();

    console.log('chromium path',execPath);

    await redis.set('chromium_exec_path', execPath)
  },
  setupMessageConsumers,
};
