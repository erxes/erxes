import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';

import { setupMessageConsumers } from './messageBroker';
import { initBrokerErkhet } from './messageBrokerErkhet';
import afterMutations from './afterMutations';
import { getSubdomain } from '@erxes/api-utils/src/core';
import * as permissions from './permissions';
import afterQueries from './afterQueries';
import payment from './payment';
import { getOrderInfo } from './routes';
import { thirdOrder } from './utils/thirdOrders';

export default {
  name: 'syncerkhet',
  permissions,
  getHandlers: [{ path: `/getOrderInfo`, method: getOrderInfo }],
  postHandlers: [
    { path: `/api/putOrder`, method: thirdOrder },
  ],
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {
    await initBrokerErkhet();
  },
  setupMessageConsumers,
  meta: {
    afterMutations,
    afterQueries,
    payment,
    permissions,
  },
};
