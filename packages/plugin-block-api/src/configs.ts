import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

import { setupMessageConsumers } from "./messageBroker";
import { getSubdomain } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import { routeErrorHandling } from "@erxes/api-utils/src/requests";
import { debugInfo } from "@erxes/api-utils/src/debuggers";
import app from "@erxes/api-utils/src/app";
// import { getBalance, sendSms, updateBalance } from './utils';

export default {
  name: "block",
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async () => {
    app.post(
      "/tdb/receive",
      routeErrorHandling(async (req, res) => {
        debugInfo(`/tdb/receive': `);
        console.log("/tdb/receive");
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        await models.Transactions.create({
          body: JSON.stringify(req.body)
        });

        res.json({ success: "200" });
      })
    );
  },
  setupMessageConsumers
};
