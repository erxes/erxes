import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { generateModels } from './connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { initBroker, sendCoreMessage } from './messageBroker';
import * as permissions from './permissions';
import { checkFilePermission } from './utils';

export let mainDb;
export let graphqlPubsub;
export let serviceDiscovery;

export let debug;

const checkPermission = async ({ subdomain, models, files, userId }) => {
  if (files.length > 0) {
    if (!userId) {
      throw new Error('Permission denied from filemanager');
    }

    const user = await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: userId },
      isRPC: true
    });

    for (const file of files) {
      await checkFilePermission({ file, subdomain, models, user });
    }
  }
};

export default {
  name: 'filemanager',
  permissions,
  graphql: sd => {
    serviceDiscovery = sd;
    return {
      typeDefs,
      resolvers
    };
  },
  segment: {},
  meta: {
    readFileHook: {
      action: async ({ subdomain, data: { key, userId } }) => {
        const models = await generateModels(subdomain);

        const files = await models.Files.find({ url: key });
        await checkPermission({ subdomain, models, files, userId });
      }
    },
    documentPrintHook: {
      action: async ({ subdomain, data: { document, userId } }) => {
        const models = await generateModels(subdomain);

        const files = await models.Files.find({ documentId: document._id });

        await checkPermission({ subdomain, models, files, userId });
      }
    }
  },
  apolloServerContext: async (context, req) => {
    const subdomain = getSubdomain(req);

    context.subdomain = subdomain;
    context.models = await generateModels(subdomain);
  },

  onServerInit: async options => {
    mainDb = options.db;

    initBroker(options.messageBrokerClient);

    debug = options.debug;
    graphqlPubsub = options.pubsubClient;
  }
};
