import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { initBroker } from './messageBroker';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { generateModels, models } from './connectionResolver';
import { routeErrorHandling } from '@erxes/api-utils/src/requests';
import { debugInfo } from '@erxes/api-utils/src/debuggers';
import app from '@erxes/api-utils/src/app';
// import { getBalance, sendSms, updateBalance } from './utils';

export let mainDb;
export let debug;

export default {
  name: 'block',
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = req.hostname;
    context.models = models;

    return context;
  },

  onServerInit: async (options) => {
    mainDb = options.db;

    app.post(
      '/tdb/receive',
      routeErrorHandling(async (req, res) => {
        debugInfo(`/tdb/receive': `);
        console.log('/tdb/receive');
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        await models.Transactions.create({
          body: JSON.stringify(req.body),
        });

        res.json({ success: '200' });
        // console.log(JSON.stringify(req.body));

        // try {
        //   const body = req.body;
        //   console.log('1', body.description);

        //   const customer = await sendContactsMessage({
        //     subdomain,
        //     action: 'customers.findOne',
        //     data: { primaryPhone: body.description },
        //     isRPC: true,
        //     defaultValue: {}
        //   });

        //   console.log('2');

        //   const erxesCustomerId = customer._id;

        //   if (customer) {
        //     console.log('3', erxesCustomerId);
        //     const balance = await getBalance(subdomain, erxesCustomerId);
        //     console.log('8', balance);

        //     const newBalance =
        //       balance + parseFloat(body.amount.replace(/,/g, ''));

        //     console.log('7', newBalance);
        //     try {
        //       await updateBalance(subdomain, erxesCustomerId, newBalance);

        //       console.log('10');

        //       await models.Transactions.create({
        //         bankStatus: 'success',
        //         body: JSON.stringify(req.body)
        //       });

        //       console.log('11');

        //       const msgBody = `Таны ${body.amount} төгрөгийн орлого амжилттай орлоо.`;

        //       await sendSms(subdomain, customer.primaryPhone, msgBody);
        //       console.log('5');

        //       return res.json({ response: 'success' });
        //     } catch (e) {
        //       console.log('4');
        //       await models.Transactions.create({
        //         bankStatus: 'error',
        //         body: JSON.stringify(req.body)
        //       });
        //       return res.json({ response: 'success' });
        //     }
        //   } else {
        //     console.log('6');
        //     await models.Transactions.create({
        //       bankStatus: 'error',
        //       body: JSON.stringify(req.body)
        //     });
        //     return res.json({ response: 'success' });
        //   }
        // } catch (e) {
        //   console.log('7');
        //   await models.Transactions.create({
        //     bankStatus: 'error',
        //     body: JSON.stringify(req.body)
        //   });

        //   return res.json({ response: 'success' });
        // }
      }),
    );

    initBroker(options.messageBrokerClient);

    debug = options.debug;
  },
};
