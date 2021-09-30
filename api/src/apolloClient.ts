import { ApolloServer, gql, PlaygroundConfig } from 'apollo-server-express';
import * as cookie from 'cookie';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { EngagesAPI, HelpersApi, IntegrationsAPI } from './data/dataSources';
import resolvers from './data/resolvers';
import * as typeDefDetails from './data/schema';
import { Conversations, Customers, Users } from './db/models';
import {
  addToArray,
  get,
  inArray,
  removeFromArray,
  set
} from './inmemoryStorage';
import { extendViaPlugins } from './pluginUtils';
import { graphqlPubsub } from './pubsub';
import { IDataLoaders, generateAllDataLoaders } from './data/dataLoaders';

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
      'request.credentials': 'include'
    }
  };
}

const generateDataSources = () => {
  return {
    EngagesAPI: new EngagesAPI(),
    IntegrationsAPI: new IntegrationsAPI(),
    HelpersApi: new HelpersApi()
  };
};

let apolloServer;

export const initApolloServer = async app => {
  const { types, queries, mutations, subscriptions } = await extendViaPlugins(
    app,
    resolvers,
    typeDefDetails
  );

  const typeDefs = gql(`
    ${types}
    type Query {
      ${queries}
    }
    type Mutation {
      ${mutations}
    }
    type Subscription {
      ${subscriptions}
    }
  `);

  apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: generateDataSources,
    playground,
    uploads: false,
    context: ({ req, res, connection }) => {
      let user = req && req.user ? req.user : null;

      if (!req) {
        if (connection && connection.context && connection.context.user) {
          user = connection.context.user;
        }

        return {
          dataSources: generateDataSources(),
          user
        };
      }

      const dataLoaders: IDataLoaders = generateAllDataLoaders();

      const requestInfo = {
        secure: req.secure,
        cookies: req.cookies
      };

      if (USE_BRAND_RESTRICTIONS !== 'true') {
        return {
          brandIdSelector: {},
          singleBrandIdSelector: {},
          userBrandIdsSelector: {},
          docModifier: doc => doc,
          commonQuerySelector: {},
          user,
          res,
          requestInfo,
          dataLoaders
        };
      }

      let scopeBrandIds = JSON.parse(req.cookies.scopeBrandIds || '[]');
      let brandIds = [];
      let brandIdSelector = {};
      let commonQuerySelector = {};
      let commonQuerySelectorElk;
      let userBrandIdsSelector = {};
      let singleBrandIdSelector = {};

      if (user) {
        brandIds = user.brandIds || [];

        if (scopeBrandIds.length === 0) {
          scopeBrandIds = brandIds;
        }

        if (!user.isOwner && scopeBrandIds.length > 0) {
          brandIdSelector = { _id: { $in: scopeBrandIds } };
          commonQuerySelector = { scopeBrandIds: { $in: scopeBrandIds } };
          commonQuerySelectorElk = { terms: { scopeBrandIds } };
          userBrandIdsSelector = { brandIds: { $in: scopeBrandIds } };
          singleBrandIdSelector = { brandId: { $in: scopeBrandIds } };
        }
      }

      return {
        brandIdSelector,
        singleBrandIdSelector,
        docModifier: doc => ({ ...doc, scopeBrandIds }),
        commonQuerySelector,
        commonQuerySelectorElk,
        userBrandIdsSelector,
        user,
        res,
        requestInfo,
        dataLoaders
      };
    },
    subscriptions: {
      keepAlive: 10000,
      path: '/subscriptions',

      onConnect(_connectionParams, webSocket: any, connectionContext: any) {
        webSocket.on('message', async message => {
          const parsedMessage = JSON.parse(message.toString()).id || {};

          if (parsedMessage.type === 'messengerConnected') {
            webSocket.messengerData = parsedMessage.value;

            const customerId =
              webSocket.messengerData && webSocket.messengerData.customerId;
            const visitorId =
              webSocket.messengerData && webSocket.messengerData.visitorId;

            const memoryStorageValue = customerId || visitorId;

            // get status from inmemory storage
            const inConnectedClients = await inArray(
              'connectedClients',
              memoryStorageValue
            );

            const inClients = await inArray('clients', memoryStorageValue);

            if (!inConnectedClients) {
              await addToArray('connectedClients', memoryStorageValue);
            }

            // Waited for 1 minute to reconnect in disconnect hook and disconnect hook
            // removed this customer from connected clients list. So it means this customer
            // is back online
            if (!inClients) {
              await addToArray('clients', memoryStorageValue);

              if (customerId) {
                // mark as online
                await Customers.markCustomerAsActive(customerId);
              }
              // notify as connected
              graphqlPubsub.publish('customerConnectionChanged', {
                customerConnectionChanged: {
                  _id: customerId,
                  status: 'connected'
                }
              });
            }
          }
        });

        let user;

        try {
          const cookies = cookie.parse(
            connectionContext.request.headers.cookie
          );

          const jwtContext = jwt.verify(
            cookies['auth-token'],
            Users.getSecret()
          );

          user = jwtContext.user;
        } catch (e) {
          user = null;
        }

        return {
          user
        };
      },

      async onDisconnect(webSocket: any) {
        const messengerData = webSocket.messengerData;

        if (messengerData) {
          const customerId = messengerData.customerId;
          const memoryStorageValue = customerId
            ? customerId
            : messengerData.visitorId;
          const integrationId = messengerData.integrationId;

          // Temporarily marking as disconnected
          // If client refreshes his browser, It will trigger disconnect, connect hooks.
          // So to determine this issue. We are marking as disconnected here and waiting
          // for 1 minute to reconnect.

          await removeFromArray('connectedClients', memoryStorageValue);

          setTimeout(async () => {
            // get status from inmemory storage
            const inNewConnectedClients = await inArray(
              'connectedClients',
              memoryStorageValue
            );
            const customerLastStatus = await get(
              `customer_last_status_${customerId}`
            );

            if (inNewConnectedClients) {
              return;
            }

            await removeFromArray('clients', memoryStorageValue);

            if (customerId) {
              // mark as offline
              await Customers.markCustomerAsNotActive(customerId);
            }
            if (customerLastStatus !== 'left') {
              set(`customer_last_status_${customerId}`, 'left');

              // customer has left + time
              const conversationMessages = await Conversations.changeCustomerStatus(
                'left',
                customerId,
                integrationId
              );

              for (const message of conversationMessages) {
                graphqlPubsub.publish('conversationMessageInserted', {
                  conversationMessageInserted: message
                });

                graphqlPubsub.publish('conversationClientTypingStatusChanged', {
                  conversationClientTypingStatusChanged: {
                    conversationId: message.conversationId,
                    text: ''
                  }
                });
              }
            }

            // notify as disconnected
            graphqlPubsub.publish('customerConnectionChanged', {
              customerConnectionChanged: {
                _id: customerId,
                status: 'disconnected'
              }
            });
          }, 60000);
        }
      }
    }
  });

  return apolloServer;
};

export default apolloServer;
