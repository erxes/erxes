import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { callBackQpay, callBackSocialPay, paymentCallback } from './utils';

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

  getHandlers: [
    { path: `/pl:payment/callBackQpay`, method: callBackQpay },
    { path: `/callBackQpay`, method: callBackQpay },
    { path: `/pl:payment/callBackSocialPay`, method: callBackSocialPay },
    { path: `/callBackSocialPay`, method: callBackSocialPay },
    { path: `/callback`, method: paymentCallback }
  ],
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
  }
};
