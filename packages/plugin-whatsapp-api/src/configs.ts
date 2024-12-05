import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { setupMessageConsumers } from "./messageBroker";
import { getSubdomain } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import initApp from "./initApp";
import { INTEGRATION_KINDS } from "./constants";
import forms from "./forms";
import segments from "./segments";
import automations from "./automations";
export default {
  name: "whatsapp",
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers()
    };
  },
  meta: {
    automations,
    forms,
    segments,
    inboxIntegrations: [
      {
        kind: INTEGRATION_KINDS.MESSENGER,
        label: "whatsapp"
      }
    ]
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    context.subdomain = subdomain;
    context.models = models;

    return context;
  },

  onServerInit: async () => {
    await initApp();
  },
  setupMessageConsumers
};
