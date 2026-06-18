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
      queueRealtimeUpdate(extension: String): String
      callSessionUpdated(inboxIntegrationId: String, uniqueid: String, extension: String): CallSession
      ticketPipelineChanged(filter: TicketsPipelineFilter): TicketSubscription
      ticketPipelineListChanged: PipelineSubscription
      ticketChanged(_id: String!): TicketSubscription
      ticketListChanged(filter: ITicketFilter): TicketSubscription
      ticketStatusChanged(_id: String!): StatusSubscription
      ticketStatusListChanged: StatusSubscription
      ticketActivityChanged(contentId: String!): TicketActivitySubscription
      cpConversationChanged(_id: String!): ConversationChangedResponse
      cpConversationMessageInserted(_id: String!): ConversationMessage
      cpConversationClientMessageInserted(userId: String!): ConversationMessage

		`,
  generateResolvers: (graphqlPubsub) => {
    const enforceCallAuth = () =>
      process.env.CALL_SUBSCRIPTION_REQUIRE_AUTH === 'true';
    const requireAuth = (context, label) => {
      if (context?.user?._id) {
        return true;
      }
      if (enforceCallAuth()) {
        return false;
      }
      console.warn(
        `[call-subscription] ${label}: unauthenticated (grace mode)`,
      );
      return true;
    };

    const sessionBelongsToUser = (session, variables, userId) => {
      if (!userId) {
        return false;
      }
      const ext = variables?.extension;
      if (ext) {
        const op = (session.ringingOperators || []).find(
          (o) => o.extensionNumber === ext,
        );
        if (op) {
          return String(op.userId) === userId;
        }
        if (session.answeredExtension === ext) {
          return String(session.answeredBy) === userId;
        }
        return false;
      }
      const ids = [
        ...(session.ringingOperators || []).map((o) => o.userId),
        session.answeredBy,
      ]
        .filter(Boolean)
        .map((id) => String(id));
      return ids.includes(userId);
    };

    return {
      // --- Ticket Pipeline ---
      ticketActivityChanged: {
        resolve: (payload) => payload.ticketActivityChanged,
        subscribe: (_, { contentId }) =>
          graphqlPubsub.asyncIterator(`ticketActivityChanged:${contentId}`),
      },

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
        resolve: (payload) => payload.conversationMessageInserted,
        subscribe: withFilter(
          (_, { _id }) =>
            graphqlPubsub.asyncIterator(`conversationMessageInserted:${_id}`),
          async (payload, variables) => {
            const conversationId =
              payload.conversationMessageInserted.conversationId;
            const id = variables._id || {};

            if (!id) return false;

            if (conversationId && id === conversationId) {
              return true;
            }
            return false;
          },
        ),
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
      queueRealtimeUpdate: {
        subscribe: withFilter(
          (_, _args, { subdomain }) =>
            graphqlPubsub.asyncIterator(`queueRealtimeUpdate:${subdomain}`),
          (payload, variables, context) => {
            if (!requireAuth(context, 'queueRealtimeUpdate')) return false;
            const response = JSON.parse(payload.queueRealtimeUpdate);
            return response.extension === variables.extension;
          },
        ),
      },

      callSessionUpdated: {
        resolve: (payload) => payload.callSessionUpdated,
        subscribe: withFilter(
          (_, { inboxIntegrationId, uniqueid, extension }) => {
            if (uniqueid) {
              return graphqlPubsub.asyncIterator(
                `callSessionUpdated:uniqueid:${uniqueid}`,
              );
            }
            if (inboxIntegrationId && extension) {
              return graphqlPubsub.asyncIterator(
                `callSessionUpdated:ext:${inboxIntegrationId}:${extension}`,
              );
            }
            return graphqlPubsub.asyncIterator(`callSessionUpdated:__denied__`);
          },
          (payload, variables, context) => {
            if (!requireAuth(context, 'callSessionUpdated')) return false;
            const session = payload?.callSessionUpdated;
            if (!session) return false;
            const userId = context?.user?._id ? String(context.user._id) : '';
            const owns = sessionBelongsToUser(session, variables, userId);
            if (!owns) {
              console.warn(
                `[call-subscription] callSessionUpdated: ${
                  userId || 'anon'
                } is not an operator on session ${session.uniqueid}`,
              );
              if (enforceCallAuth()) return false;
            }
            return true;
          },
        ),
      },
      cpConversationChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationChanged:${_id}`),
      },

      cpConversationMessageInserted: {
        resolve: (payload) => payload.conversationMessageInserted,
        subscribe: withFilter(
          (_, { _id }) =>
            graphqlPubsub.asyncIterator(`conversationMessageInserted:${_id}`),
          async (payload, variables) => {
            const conversationId =
              payload.conversationMessageInserted.conversationId;
            return !!conversationId && variables._id === conversationId;
          },
        ),
      },

      cpConversationClientMessageInserted: {
        resolve: (payload) => payload.conversationClientMessageInserted,
        subscribe: (_, { userId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `conversationClientMessageInserted:${subdomain}:${userId}`,
          ),
      },
    };
  },
};
