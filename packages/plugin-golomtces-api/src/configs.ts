import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';

import { setupMessageConsumers } from './messageBroker';
import { generateExpiredToken } from './api';

export default {
  name: 'golomtces',
  graphql: (sd) => {
    return {
      typeDefs,
      resolvers,
    };
  },

  postHandlers: [
    {
      path: `/token-by-user`,
      method: async (req, res) => {
        try {
          const response = await generateExpiredToken(req.body);
          return res.json(response);
        } catch (e) {
          console.error(e.message);
          return res.json({ error: e.message });
        }
      },
    },
    {
      path: `/hook-message`,
      method: async (req, res) => {
        try {
          const response = await generateExpiredToken(req.body);
          return res.json(response);
        } catch (e) {
          console.error(e.message);
          return res.json({ error: e.message });
        }
      },
    },
  ],
  apolloServerContext: async (context) => {
    return context;
  },

  onServerInit: async () => {},
  setupMessageConsumers,
};
