import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker, sendContactsMessage } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels } from './connectionResolver';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { debugInfo } from '@erxes/api-utils/src/debuggers';
import { getBalance, sendSms, updateBalance } from './utils';

export let mainDb;
export let debug;
export let graphqlPubsub;
export let serviceDiscovery;

export default {
  name: 'block',
  graphql: async sd => {
    serviceDiscovery = sd;

    return {
      typeDefs: await typeDefs(sd),
      resolvers: await resolvers(sd)
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async options => {
    mainDb = options.db;
    const app = options.app;

    app.post(
      '/tdb/receive',
      routeErrorHandling(async (req, res) => {
        debugInfo(`/tdb/receive': `);
        console.log('/tdb/receive');
        console.log(JSON.stringify(req.body));

        const body = req.body;

        const subdomain = getSubdomain(req);

        const models = await generateModels(subdomain);

        const customer = await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: { primaryPhone: body.description },
          isRPC: true,
          defaultValue: {}
        });

        const erxesCustomerId = customer._id;

        if (customer) {
          const balance = await getBalance(subdomain, erxesCustomerId);

          const newBalance =
            balance + parseFloat(body.amount.replace(/,/g, ''));

          try {
            await updateBalance(subdomain, erxesCustomerId, newBalance);

            await models.Transactions.create({
              bankStatus: 'success',
              body: JSON.stringify(req.body)
            });

            const msgBody = `Таны ${body.amount} төгрөгийн орлого амжилттай орлоо.`;

            await sendSms(subdomain, customer.primaryPhone, msgBody);
          } catch (e) {
            await models.Transactions.create({
              bankStatus: 'error',
              body: JSON.stringify(req.body)
            });
          }
        } else {
          await models.Transactions.create({
            bankStatus: 'error',
            body: JSON.stringify(req.body)
          });
        }

        return res.json({ response: 'success' });
      })
    );

    initBroker(options.messageBrokerClient);

    graphqlPubsub = options.pubsubClient;

    debug = options.debug;
  }
};
