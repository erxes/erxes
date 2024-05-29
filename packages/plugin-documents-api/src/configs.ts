import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { getServices, getService } from '@erxes/api-utils/src/serviceDiscovery';
import { setupMessageConsumers, sendCommonMessage } from './messageBroker';
import * as permissions from './permissions';
import { helper } from './utils';

export default {
  name: 'documents',
  permissions,
  graphql: () => {
    return {
      typeDefs,
      resolvers,
    };
  },
  segment: {},
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },
  meta: {
    permissions,
  },

  getHandlers: [
    {
      path: '/print',
      method: async (req, res, next) => {
        const { _id, copies, width, itemId } = req.query;
        const subdomain = getSubdomain(req);
        const models = await generateModels(subdomain);

        let document;
        try {
          document = await models.Documents.findOne({
            $or: [{ _id }, { code: _id }],
          });
        } catch (e) {
          document = await models.Documents.findOne({ code: _id });
        }

        if (!document) {
          return res.send('Not found');
        }

        const userId = req.headers.userid;

        if (!userId) {
          return next(new Error('Permission denied'));
        }

        const services = await getServices();

        for (const serviceName of services) {
          const service = await getService(serviceName);
          const meta = service.config?.meta || {};

          if (meta && meta.documentPrintHook) {
            try {
              await sendCommonMessage({
                subdomain,
                action: 'documentPrintHook',
                isRPC: true,
                serviceName,
                data: { document, userId },
              });
            } catch (e) {
              return next(e);
            }
          }
        }

        const { multipliedResults, style, script } = await helper(subdomain, document, req.query)

        return res.send(multipliedResults + style + script);
      },
    },
  ],

  onServerInit: async () => { },
  setupMessageConsumers,
};
