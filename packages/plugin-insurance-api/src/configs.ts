import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import * as cookieParser from 'cookie-parser';
import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import forms from './forms';
import * as fs from 'fs';
import * as path from 'path';
import { buildFile } from './graphql/resolvers/utils';
import documents from './documents';
import payment from './payment';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'insurance',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  meta: {
    forms,
    documents,
    payment
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
  middlewares: [cookieParser(), cpUserMiddleware],

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    const app = options.app;

    const publicDir = path.join('./uploads');

    fs.access(publicDir, fs.constants.F_OK, err => {
      if (err) {
        // 'public' directory doesn't exist, create it
        fs.mkdir(publicDir, mkdirErr => {
          if (mkdirErr) {
            console.error('Error creating uploads directory:', mkdirErr);
          } else {
            console.log('uploads directory created');
          }
        });
      } else {
        // 'public' directory exists
        console.log('uploads directory already exists');
      }
    });

    // app.get('/download', async (req, res) => {
    //   const { name } = req.query;

    //   const filePath = `./uploads/${name}`;

    //   // res.download(filePath, name);

    //   res.download(filePath, name, err => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       // remove file from server
    //       fs.unlinkSync(filePath);
    //       console.log('success');
    //     }
    //   });
    // });

    app.get('/export', async (req, res) => {
      const { cpUser } = req;
      if (!cpUser) {
        return res.status(401).send('Unauthorized');
      }

      const { query } = req;

      const subdomain = getSubdomain(req);

      const models = await generateModels(subdomain);

      const result = await buildFile(models, subdomain, cpUser, query);

      res.attachment(`${result.name}.xlsx`);

      return res.send(result.response);
    });
  }
};
