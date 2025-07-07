import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";
import { setupMessageConsumers } from "./messageBroker";
import { getSubdomain } from "@erxes/api-utils/src/core";
import { generateModels } from "./connectionResolver";
import payment from "./payment";
import tags from "./tags";
import cronjobs from "./cronjobs";

export default {
  name: "bm",
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },
  meta: {
    payment,
    tags,
    forms: {
      form: {
        title: 'Tour booking',
        description: 'Build tour booking forms',
        contentType: 'bm-tours',
        icon: 'mountains-sun',
      },
    },
    cronjobs,
  },

  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
