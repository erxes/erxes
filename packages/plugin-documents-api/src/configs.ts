import typeDefs from "./graphql/typeDefs";
import resolvers from "./graphql/resolvers";

import { generateModels } from "./connectionResolver";
import { getSubdomain } from "@erxes/api-utils/src/core";
import { setupMessageConsumers, sendCommonMessage } from "./messageBroker";
import * as permissions from "./permissions";
import { prepareDoc } from "./util";

export default {
  name: "documents",
  permissions,

  graphql: () => {
    return {
      typeDefs,
      resolvers
    };
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },
  meta: {
    permissions
  },

  getHandlers: [
    {
      path: "/print",
      method: async (req, res, next) => {
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);
        try {
          const { multipliedResults, style, script } = await prepareDoc(
            models,
            subdomain,
            req.query,
            req.headers.userid
          );

          return res.send(multipliedResults + style + script);
        } catch (err) {
          return next(err);
        }
      }
    }
  ],

  onServerInit: async () => {},
  setupMessageConsumers
};
