import { getSubdomain } from '@erxes/api-utils/src/core';
import { Router } from 'express';
import * as express from 'express';
import * as path from 'path';
import * as React from 'react';

import { POST_CALLBACK_TYPES } from '../constants';
import { generateModels } from './connectionResolver';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { initBroker } from './messageBroker';
import { getHandler, postHandler } from './utils';
import controllers from './controllers';

const router = Router();

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'payment',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  hasSubscriptions: true,

  getHandlers: [{ path: `/callback`, method: getHandler }],

  postHandlers: POST_CALLBACK_TYPES.ALL.map(type => ({
    path: `/callback/${type}`,
    method: postHandler
  })),

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;

    const { app } = options;

    app.use(express.static('public'));
    app.use(express.static(path.join(__dirname, 'public')));

    // app.get('*', (_req, res) => {
    //   res.sendFile(path.join(__dirname, 'public', 'index.html'));
    // });
    // app.get('/gateway', (req, res) => {
    //   return res.send('gateway');
    // });

    // app.get('/', (req, res) => {
    //   const body = renderToString(React.createElement(App));

    //   res.send(
    //     html({
    //       body
    //     })
    //   );
    // })

    app.use(controllers);

    // renderPaymentGateway(app);
  }
};
