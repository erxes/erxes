import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { generateModels } from "./connectionResolver";

import { setupMessageConsumers } from "./messageBroker";
import { getSubdomain } from "@erxes/api-utils/src/core";
import * as permissions from "./permissions";

import { getOrderInfo } from "./routes";
import reports from "./reports/reports";

export default {
  name: "pms",

  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {
    // await initBrokerErkhet();
  },
  setupMessageConsumers,
  meta: {
    // afterMutations,
    // afterQueries,
    permissions,
    reports
  }
};
