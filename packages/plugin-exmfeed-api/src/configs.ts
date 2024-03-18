import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { generateModels } from './connectionResolver';
import { setupMessageConsumers } from './messageBroker';
import * as permissions from './permissions';
import cronjobs, {
  createCeremonies,
  sendCeremonyNotification,
} from './cronjobs';

import automations from './automations';
import segments from './segments';
import forms from './forms';
import app from '@erxes/api-utils/src/app';
import { getSubdomainHeader } from '@erxes/api-utils/src/headers';

export default {
  name: 'exmfeed',
  permissions,
  graphql: async () => {
    return {
      typeDefs: await typeDefs(),
      resolvers: await resolvers(),
    };
  },

  apolloServerContext: async (context, req) => {
    const { subdomain } = context;

    context.models = await generateModels(subdomain);

    return context;
  },

  onServerInit: async () => {
    app.get('/trigger-cron', async (req, res) => {
      const subdomain = getSubdomainHeader(req);

      await createCeremonies(subdomain);
      await sendCeremonyNotification(subdomain);

      return res.send('ok');
    });
  },

  meta: { cronjobs, automations, segments, forms, permissions },
};
