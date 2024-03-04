import { getSubdomain } from '@erxes/api-utils/src/core';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as path from 'path';

import afterMutations from './afterMutations';
import { generateModels } from './connectionResolver';
import dashboards from './dashboards';
import exporter from './exporter';
import forms from './forms';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { setupMessageConsumers } from './messageBroker';
import cpUserMiddleware from './middlewares/cpUserMiddleware';
import * as permissions from './permissions';
import segments from './segments';
import { getTransportData, updateTrackingData } from './utils';
import payment from './payment';
import app from '@erxes/api-utils/src/app';



export default {
  name: 'tumentech',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  hasSubscriptions: true,
  subscriptionPluginPath: require('path').resolve(
    __dirname,
    'graphql',
    'subscriptionPlugin.js',
  ),
  hasDashboard: true,

  postHandlers: [
    {
      path: `/transports`,
      method: getTransportData,
    },
    {
      path: `/tracking`,
      method: updateTrackingData,
    },
  ],

  getHandlers: [
    {
      path: `/download`,
      method: async (req, res) => {
        const userAgent = req.headers['user-agent'];
        const isAndroid = /Android/.test(userAgent);
        const isiOS = /(iPhone|iPad|iPod)/.test(userAgent);

        if (isiOS) {
          return res.redirect(
            'https://apps.apple.com/us/app/%D1%82%D2%AF%D0%BC%D1%8D%D0%BD-%D1%82%D1%8D%D1%8D%D1%85/id1610092431',
          );
        }

        if (isAndroid) {
          return res.redirect(
            'https://play.google.com/store/apps/details?id=com.tumentech',
          );
        }

        return res.redirect('https://www.tumentech.mn/');
      },
    },
  ],

  meta: {
    segments,
    forms,
    afterMutations,
    exporter,
    dashboards,
    payment,
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
  onServerInit: async () => {
    app.use('/static', express.static(path.join(__dirname, '/public')));
  },
  setupMessageConsumers,
};
