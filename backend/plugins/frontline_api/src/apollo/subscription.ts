import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'frontline',
  typeDefs: `
			conversationChanged(_id: String!): ConversationChangedResponse
			conversationMessageInserted(_id: String!): ConversationMessage
			conversationClientMessageInserted(userId: String!): ConversationMessage
			conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
			conversationAdminMessageInserted(customerId: String): ConversationAdminMessageInsertedResponse
			conversationExternalIntegrationMessageInserted: JSON
			conversationBotTypingStatus(_id: String!): JSON
      waitingCallReceived(extension: String): String
      talkingCallReceived(extension: String): String
      agentCallReceived(extension: String): String
      queueRealtimeUpdate(extension: String): String
      ticketPipelineChanged(filter: TicketsPipelineFilter): TicketSubscription 
      ticketPipelineListChanged: PipelineSubscription
      ticketChanged(_id: String!): TicketSubscription
      ticketListChanged(filter: ITicketFilter): TicketSubscription
      ticketStatusChanged(_id: String!): StatusSubscription
      ticketStatusListChanged: StatusSubscription
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      // --- Ticket Pipeline ---
      ticketPipelineChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketPipelineChanged:${_id}`),
      },
      ticketPipelineListChanged: {
        subscribe: () =>
          graphqlPubsub.asyncIterator('ticketPipelineListChanged'),
      },

      // --- Ticket Status ---
      ticketStatusChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketStatusChanged:${_id}`),
      },
      ticketStatusListChanged: {
        subscribe: () => graphqlPubsub.asyncIterator('ticketStatusListChanged'),
      },

      // --- Ticket ---
      ticketChanged: {
        resolve: (payload) => payload.ticketChanged,
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketChanged:${_id}`),
      },

      ticketListChanged: {
        resolve: (payload) => payload.ticketListChanged,
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('ticketListChanged'),
          async (payload, variables) => {
            const ticket = payload.ticketListChanged.ticket;
            const filter = variables.filter || {};

            if (!filter) return true;

            if (filter._id && ticket._id === filter._id) {
              return true;
            }

            if (filter.name) {
              const regex = new RegExp(filter.name, 'i');
              if (!regex.test(ticket.name)) return false;
            }

            if (filter.status && ticket.status !== filter.status) return false;
            if (filter.priority && ticket.priority !== filter.priority)
              return false;

            if (
              filter.startDate &&
              new Date(ticket.startDate) < new Date(filter.startDate)
            )
              return false;

            if (
              filter.targetDate &&
              new Date(ticket.targetDate) < new Date(filter.targetDate)
            )
              return false;

            if (
              filter.createdAt &&
              new Date(ticket.createdAt) < new Date(filter.createdAt)
            )
              return false;

            if (filter.pipelineId && ticket.pipelineId !== filter.pipelineId)
              return false;
            if (filter.createdBy && ticket.createdBy !== filter.createdBy)
              return false;
            if (filter.assigneeId && ticket.assigneeId !== filter.assigneeId)
              return false;
            if (filter.channelId && ticket.channelId !== filter.channelId)
              return false;

            if (
              filter.userId &&
              !filter.pipelineId &&
              !filter.assigneeId &&
              ticket.assigneeId !== filter.userId
            ) {
              return false;
            }

            return true;
          },
        ),
      },

      /*
       * Listen for conversation changes like status, assignee, read state
       */
      conversationChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationChanged:${_id}`),
      },

      /*
       * Listen for new message insertion
       */
      conversationMessageInserted: {
        resolve(payload, args, { dataSources: { gatewayDataSource } }, info) {
          if (!payload) {
            console.error(
              `Subscription resolver error: conversationMessageInserted: payload is ${payload}`,
            );
            return;
          }
          if (!payload.conversationMessageInserted) {
            console.error(
              `Subscription resolver error: conversationMessageInserted: payload.conversationMessageInserted is ${payload.conversationMessageInserted}`,
            );
            return;
          }
          if (!payload.conversationMessageInserted._id) {
            console.error(
              `Subscription resolver error: conversationMessageInserted: payload.conversationMessageInserted._id is ${payload.conversationMessageInserted._id}`,
            );
            return;
          }
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.conversationMessageInserted._id },
            buildQueryUsingSelections: (selections) => `
                  query Subscription_GetMessage($_id: String!) {
                    conversationMessage(_id: $_id) {
                      ${selections}
                    }
                  }
              `,
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationMessageInserted:${_id}`),
      },

      /*
       * Show typing while waiting Bot response
       */
      conversationBotTypingStatus: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationBotTypingStatus:${_id}`),
      },

      /*
       * Admin is listening for this subscription to show typing notification
       */
      conversationClientTypingStatusChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(
            `conversationClientTypingStatusChanged:${_id}`,
          ),
      },

      /*
       * Admin is listening for this subscription to show unread notification
       */
      conversationClientMessageInserted: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          if (!payload) {
            console.error(
              `Subscription resolver error: conversationClientMessageInserted: payload is ${payload}`,
            );
            return;
          }
          if (!payload.conversationClientMessageInserted) {
            console.error(
              `Subscription resolver error: conversationClientMessageInserted: payload.conversationClientMessageInserted is ${payload.conversationClientMessageInserted}`,
            );
            return;
          }
          if (!payload.conversationClientMessageInserted._id) {
            console.error(
              `Subscription resolver error: conversationClientMessageInserted: payload.conversationClientMessageInserted._id is ${payload.conversationClientMessageInserted._id}`,
            );
            return;
          }
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: {
              _id: payload.conversationClientMessageInserted._id,
            },
            buildQueryUsingSelections: (selections) => `
                  query Subscription_GetMessage($_id: String!) {
                    conversationMessage(_id: $_id) {
                      ${selections}
                    }
                  }
              `,
          });
        },
        subscribe: withFilter(
          (_, { userId }, { subdomain }) => {
            return graphqlPubsub.asyncIterator(
              `conversationClientMessageInserted:${subdomain}:${userId}`,
            );
          },
          async (payload) => {
            const { conversation, integration } = payload;
            console.log(conversation, integration, 'conversation, integration');
            if (!conversation) {
              return false;
            }

            if (!integration) {
              return false;
            }

            return true;
          },
        ),
      },

      /*
       * Widget is listening for this subscription to show unread notification
       */
      conversationAdminMessageInserted: {
        subscribe: (_, { customerId }) =>
          graphqlPubsub.asyncIterator(
            `conversationAdminMessageInserted:${customerId}`,
          ),
      },

      /*
       * Integrations api is listener
       */
      conversationExternalIntegrationMessageInserted: {
        subscribe: () =>
          graphqlPubsub.asyncIterator(
            'conversationExternalIntegrationMessageInserted',
          ),
      },

      //call center subscriptions
      waitingCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`waitingCallReceived`),
          (payload, variables) => {
            const response = JSON.parse(payload.waitingCallReceived);
            return response.extension === variables.extension;
          },
        ),
      },
      talkingCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`talkingCallReceived`),
          (payload, variables) => {
            const response = JSON.parse(payload.talkingCallReceived);
            return response.extension === variables.extension;
          },
        ),
      },

      agentCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`agentCallReceived`),
          (payload, variables) => {
            const response = JSON.parse(payload.agentCallReceived);
            return response.extension === variables.extension;
          },
        ),
      },

      queueRealtimeUpdate: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`queueRealtimeUpdate`),
          (payload, variables) => {
            const response = JSON.parse(payload.queueRealtimeUpdate);
            return response.extension === variables.extension;
          },
        ),
      },
    };
  },
};
