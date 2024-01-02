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
import * as moment from 'moment';

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
    forms
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

    const publicDir = path.join('./public');

    fs.access(publicDir, fs.constants.F_OK, err => {
      if (err) {
        // 'public' directory doesn't exist, create it
        fs.mkdir(publicDir, mkdirErr => {
          if (mkdirErr) {
            console.error('Error creating public directory:', mkdirErr);
          } else {
            console.log('Public directory created');
          }
        });
      } else {
        // 'public' directory exists
        console.log('Public directory already exists');
      }
    });

    app.get('/download', async (req, res) => {
      const { name } = req.query;

      const filePath = `./public/${name}`;

      // return {
      //   name: `${moment().format('YYYY-MM-DD HH:mm')}`,
      //   response: await generateXlsx(workbook)
      // };
    });
  }
};
