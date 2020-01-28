import { ApolloServer, PlaygroundConfig } from 'apollo-server-express';
import * as dotenv from 'dotenv';
import { EngagesAPI, IntegrationsAPI } from './data/dataSources';
import resolvers from './data/resolvers';
import typeDefs from './data/schema';
import { Conversations, Customers } from './db/models';
import { graphqlPubsub } from './pubsub';
import { addToArray, get, inArray, removeFromArray, set } from './redisClient';

// load environment variables
dotenv.config();

const { NODE_ENV, USE_BRAND_RESTRICTIONS } = process.env;

let playground: PlaygroundConfig = false;

if (NODE_ENV !== 'production') {
  playground = {
    settings: {
      'general.betaUpdates': false,
      'editor.theme': 'dark',
      'editor.reuseHeaders': true,
      'tracing.hideTracingResponse': true,
      'editor.fontSize': 14,
      'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      'request.credentials': 'include',
    },
  };
}

const generateDataSources = () => {
  return {
    EngagesAPI: new EngagesAPI(),
    IntegrationsAPI: new IntegrationsAPI(),
  };
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: generateDataSources,
  playground,
  uploads: false,
  context: ({ req, res }) => {
    if (!req || NODE_ENV === 'test') {
      return {
        dataSources: generateDataSources(),
      };
    }

    const requestInfo = {
      secure: req.secure,
    };

    const user = req.user;

    if (USE_BRAND_RESTRICTIONS !== 'true') {
      return {
        brandIdSelector: {},
        userBrandIdsSelector: {},
        docModifier: doc => doc,
        commonQuerySelector: {},
        user,
        res,
        requestInfo,
      };
    }

    let scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || '[]');
    let brandIds = [];
    let brandIdSelector = {};
    let commonQuerySelector = {};
    let userBrandIdsSelector = {};

    if (user) {
      brandIds = user.brandIds || [];

      if (scopeBrandIds.length === 0) {
        scopeBrandIds = brandIds;
      }

      if (!user.isOwner) {
        brandIdSelector = { _id: { $in: scopeBrandIds } };
        commonQuerySelector = { scopeBrandIds: { $in: scopeBrandIds } };
        userBrandIdsSelector = { brandIds: { $in: scopeBrandIds } };
      }
    }

    return {
      brandIdSelector,
      docModifier: doc => ({ ...doc, scopeBrandIds }),
      commonQuerySelector,
      userBrandIdsSelector,
      user,
      res,
      requestInfo,
    };
  },
  subscriptions: {
    keepAlive: 10000,
    path: '/subscriptions',

    onConnect(_connectionParams, webSocket: any) {
      webSocket.on('message', async message => {
        const parsedMessage = JSON.parse(message.toString()).id || {};

        if (parsedMessage.type === 'messengerConnected') {
          webSocket.messengerData = parsedMessage.value;

          const customerId = webSocket.messengerData.customerId;

          // get status from redis
          const inConnectedClients = await inArray('connectedClients', customerId);
          const inClients = await inArray('clients', customerId);

          if (!inConnectedClients) {
            await addToArray('connectedClients', customerId);
          }

          // Waited for 1 minute to reconnect in disconnect hook and disconnect hook
          // removed this customer from connected clients list. So it means this customer
          // is back online
          if (!inClients) {
            await addToArray('clients', customerId);

            // mark as online
            await Customers.markCustomerAsActive(customerId);

            // notify as connected
            graphqlPubsub.publish('customerConnectionChanged', {
              customerConnectionChanged: {
                _id: customerId,
                status: 'connected',
              },
            });
          }
        }
      });
    },

    async onDisconnect(webSocket: any) {
      const messengerData = webSocket.messengerData;

      if (messengerData) {
        const customerId = messengerData.customerId;
        const integrationId = messengerData.integrationId;

        // Temporarily marking as disconnected
        // If client refreshes his browser, It will trigger disconnect, connect hooks.
        // So to determine this issue. We are marking as disconnected here and waiting
        // for 1 minute to reconnect.
        await removeFromArray('connectedClients', customerId);

        setTimeout(async () => {
          // get status from redis
          const inNewConnectedClients = await inArray('connectedClients', customerId);
          const customerLastStatus = await get(`customer_last_status_${customerId}`);

          if (inNewConnectedClients) {
            return;
          }

          await removeFromArray('clients', customerId);

          // mark as offline
          await Customers.markCustomerAsNotActive(customerId);

          if (customerLastStatus !== 'left') {
            set(`customer_last_status_${customerId}`, 'left');

            // customer has left + time
            const conversationMessages = await Conversations.changeCustomerStatus('left', customerId, integrationId);

            for (const message of conversationMessages) {
              graphqlPubsub.publish('conversationMessageInserted', {
                conversationMessageInserted: message,
              });

              graphqlPubsub.publish('conversationClientTypingStatusChanged', {
                conversationClientTypingStatusChanged: {
                  conversationId: message.conversationId,
                  text: '',
                },
              });
            }
          }

          // notify as disconnected
          graphqlPubsub.publish('customerConnectionChanged', {
            customerConnectionChanged: {
              _id: customerId,
              status: 'disconnected',
            },
          });
        }, 60000);
      }
    },
  },
});

export default apolloServer;
