import { getSubdomain } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import resolvers from "./graphql/resolvers";
import typeDefs from "./graphql/typeDefs";
import { setupMessageConsumers } from "./messageBroker";
import * as permissions from "./permissions";

export default {
  name: "programs",
  permissions,
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

  onServerInit: async () => {},
  setupMessageConsumers,
  meta: { permissions },
};
