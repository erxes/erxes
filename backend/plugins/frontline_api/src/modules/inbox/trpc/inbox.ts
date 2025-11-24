import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import {
  receiveInboxMessage,
  receiveIntegrationsNotification,
} from '@/inbox/receiveMessage';
import { getIntegrationsKinds } from '@/inbox/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { IEngageData } from '@/inbox/@types/conversationMessages';
import { IConversationDocument } from '../@types/conversations';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FrontlineTRPCContext } from '~/init-trpc';

const t = initTRPC.context<FrontlineTRPCContext>().create();
interface CreateConversationAndMessageParams {
  userId?: string;
  status?: string;
  customerId?: string;
  visitorId?: string;
  integrationId: string;
  content: string;
  engageData?: IEngageData;
  formWidgetData?: Record<string, unknown>;
}
const EngageDataSchema = z.object({
  messageId: z.string(),
  brandId: z.string(),
  content: z.string(),
  fromUserId: z.string(),
  kind: z.string(),
  sentAs: z.string(),
});

const createConversationAndMessage = async (
  models: IModels,
  params: CreateConversationAndMessageParams,
) => {
  const {
    userId,
    status,
    customerId,
    visitorId,
    integrationId,
    content,
    engageData,
    formWidgetData,
  } = params;
  // create conversation
  const conversation = await models.Conversations.createConversation({
    userId,
    status,
    customerId,
    visitorId,
    integrationId,
    content,
  });

  // create message
  const message = await models.ConversationMessages.createMessage({
    engageData,
    formWidgetData,
    conversationId: conversation._id,
    userId,
    customerId,
    visitorId,
    content,
  });
  return { conversation, message };
};

export const integrationsRouter = t.router({
  receive: t.procedure.input(z.any()).mutation(async ({ input, ctx }) => {
    const { subdomain } = ctx;
    try {
      const result = await receiveInboxMessage(subdomain, input);

      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
        message: 'Message received successfully',
      };
    } catch (error) {
      return {
        status: 'error',
        error: {
          code: 'INTEGRATION_RECEIVE_FAILED',
          message:
            error instanceof Error
              ? error.message
              : 'Хүлээн авахад алдаа гарлаа',
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),

  remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { _id } = input;
    if (!_id) {
      return {
        status: 'error',
        error: {
          code: 'INVALID_INPUT',
          message: 'Integration ID is required for deletion',
        },
        timestamp: new Date().toISOString(),
      };
    }
    const { models } = ctx;
    try {
      const conversationIds = await models.Conversations.find({
        integrationId: _id,
      }).distinct('_id');
      await models.ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds },
      });
      await models.Conversations.deleteMany({ integrationId: _id });
      return models.Integrations.removeIntegration(_id);
    } catch (error) {
      console.error('Failed to create integration:', error);

      return {
        status: 'error',
        error: {
          code: 'INTEGRATION_CREATION_FAILED',
          message: 'Failed to create integration',
          details: error instanceof Error ? error.message : undefined,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),

  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { query = {}, options } = input;
    const { models } = ctx;
    try {
      const integrations = await models.Integrations.findIntegrations(
        query,
        options,
      );

      return {
        status: 'success',
        data: integrations,
        meta: {
          count: integrations.length,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch integrations:', error);

      return {
        status: 'error',
        error: {
          code: 'INTEGRATIONS_FETCH_FAILED',
          message: 'Failed to retrieve integrations',
          details: error instanceof Error ? error.message : undefined,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),

  copyLeadIntegration: t.procedure
    .input(z.any())
    .mutation(async ({ ctx, input }) => {
      const { _id, userId } = input;
      const { models } = ctx;
      try {
        const integration = await models.Integrations.duplicateLeadIntegration(
          _id,
          userId,
        );

        return {
          status: 'success',
          data: integration,
          message: 'Lead integration copied successfully',
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Failed to copy lead integration:', error);

        return {
          status: 'error',
          error: {
            code: 'LEAD_INTEGRATION_COPY_FAILED',
            message: 'Failed to duplicate lead integration',
            details: error instanceof Error ? error.message : undefined,
            suggestion: 'Please verify the integration exists and try again',
            ...(process.env.NODE_ENV === 'development' && {
              stack: error instanceof Error ? error.stack : undefined,
            }),
          },
          timestamp: new Date().toISOString(),
        };
      }
    }),

  count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    const { selector = {}, filters } = input;

    try {
      const query = {
        ...selector,
        ...(filters && { ...filters }),
      };

      const count = await models.Integrations.countDocuments(query);

      return {
        status: 'success',
        data: count,
        meta: {
          filteredBy:
            Object.keys(query).length > 0 ? Object.keys(query) : ['all'],
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('Count operation failed:', error);

      return {
        status: 'error',
        error: {
          code: 'COUNT_OPERATION_FAILED',
          message: 'Failed to count documents',
          details: error instanceof Error ? error.message : 'Database error',
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),

  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Integrations.findOne(input).lean();

      if (!result) {
        return {
          status: 'error',
          error: {
            code: 'NOT_FOUND',
            message: 'Integration not found',
            suggestion: 'Please verify the search criteria',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'success',
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('FindOne operation failed:', error);

      return {
        status: 'error',
        error: {
          code: 'FIND_ONE_FAILED',
          message: 'Failed to find integration',
          details: error instanceof Error ? error.message : 'Database error',
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),
});

export const conversationMessagesRouter = t.router({
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      // Build the query from validated input
      const message = await models.ConversationMessages.findOne(input).lean();

      if (!message) {
        return {
          status: 'error',
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Conversation message not found',
            suggestion: 'Verify the message identifiers and try again',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return {
        status: 'success',
        data: message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to find conversation message:', error);

      return {
        status: 'error',
        error: {
          code: 'MESSAGE_FIND_FAILED',
          message: 'Failed to retrieve message',
          details: error instanceof Error ? error.message : 'Database error',
          ...(process.env.NODE_ENV === 'development' && {
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        timestamp: new Date().toISOString(),
      };
    }
  }),

  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const { skip, limit } = input;
      const { models } = ctx;

      if (skip || limit) {
        const queryParams = { ...input };
        delete queryParams.skip;
        delete queryParams.limit;

        const result = await models.ConversationMessages.find(queryParams)
          .skip(skip || 0)
          .limit(limit || 20)
          .lean();

        return {
          status: 'success',
          data: result,
        };
      }

      const result = await models.ConversationMessages.find(input).lean();
      return {
        status: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Error fetching conversation messages:', error);

      return {
        status: 'error',
        message: 'Failed to fetch conversation messages',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }
  }),
});

export const conversationsRouter = t.router({
  count: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const { query = {}, options } = input;
      const { models } = ctx;

      const count = await models.Conversations.find(query)
        .skip(options?.skip || 0)
        .limit(options?.limit || 0) // 0 means no limit
        .countDocuments();

      return {
        status: 'success',
        data: count,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Count documents error:', error);

      return {
        status: 'error',
        message: 'Failed to count documents',
        ...(process.env.NODE_ENV === 'development' && {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }),
      };
    }
  }),

  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const { query } = input;
      const { models } = ctx;

      if (!query) {
        return {
          status: 'error',
          message: 'Query parameter is required',
        };
      }

      const conversation = await models.Conversations.findOne(query).lean();

      if (!conversation) {
        return {
          status: 'success',
          data: null,
          message: 'No conversation found',
        };
      }

      return {
        status: 'success',
        data: conversation,
      };
    } catch (error) {
      console.error('Error finding conversation:', error);
      return {
        status: 'error',
        message: 'Failed to find conversation',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }
  }),

  changeStatus: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const { id, status } = input;
      const { models } = ctx;

      if (!id || !status) {
        return {
          status: 'error',
          message: `Both id and status are required. Received id: ${id}, status: ${status}`,
        };
      }

      const result = await models.Conversations.updateOne(
        { _id: id },
        { status: status },
      );

      if (result.matchedCount === 0) {
        return {
          status: 'not_found',
          message: 'No conversation found with the provided ID',
        };
      }

      return {
        status: 'success',
        data: result,
      };
    } catch (error) {
      console.error('Update error:', error);
      return {
        status: 'error',
        message: 'Update failed',
        error:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      };
    }
  }),
});

export const visitorRouter = t.router({});
export const channelsRouter = t.router({
  find: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const data = await models.Channels.find(input)
        .lean()
        .maxTimeMS(5000)
        .exec();
      return {
        status: 'success',
        data,
        count: data.length, // Helpful metadata
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('channels query error:', error);

      return {
        status: 'error',
        message: 'Failed to fetch channels',
        code: 'QUERY_FAILED',
        ...(process.env.NODE_ENV === 'development' && {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }),
      };
    }
  }),
});

export const inboxTrpcRouter = t.router({
  inbox: t.router({
    integrations: integrationsRouter,
    conversationMessages: conversationMessagesRouter,
    conversations: conversationsRouter,
    visitor: visitorRouter,
    channels: channelsRouter,
    createConversationAndMessage: t.procedure
      .input(
        z.object({
          userId: z.string().min(1, 'User ID is required'),
          status: z.string().optional().default('new'),
          customerId: z.string().optional(),
          visitorId: z.string().optional(),
          integrationId: z.string().min(1, 'Integration ID is required'),
          content: z.string().min(1, 'Message content cannot be empty'),
          engageData: EngageDataSchema.optional(),
          formWidgetData: z.record(z.unknown()).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        try {
          const response = await createConversationAndMessage(models, input);

          return {
            status: 'success',
            data: response,
            timestamp: new Date().toISOString(),
            message: 'Conversation created successfully',
          };
        } catch (error) {
          console.error('Create conversation error:', error);

          const errorDetails =
            error instanceof Error
              ? {
                  message: error.message,
                  stack:
                    process.env.NODE_ENV === 'development'
                      ? error.stack
                      : undefined,
                }
              : {
                  message: 'Unknown error occurred',
                };

          return {
            status: 'error',
            error: {
              code: 'CONVERSATION_CREATION_FAILED',
              ...errorDetails,
              suggestion: 'Please try again or contact support',
            },
            timestamp: new Date().toISOString(),
          };
        }
      }),

    createOnlyMessage: t.procedure
      .input(
        z.object({
          conversationId: z.string().min(1, 'Conversation ID is required'),
          content: z.string().min(1, 'Message content cannot be empty'),
          userId: z.string().min(1, 'User ID is required'),
          customerId: z.string().optional(),
          internal: z.boolean().default(false),
          contentType: z.string().default('text'),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;

        try {
          const message = await models.ConversationMessages.createMessage({
            conversationId: input.conversationId,
            content: input.content,
            userId: input.userId,
            customerId: input.customerId,
            internal: input.internal,
            contentType: input.contentType,
          });

          return {
            status: 'success',
            data: message,
            timestamp: new Date().toISOString(),
            message: 'Message created successfully',
          };
        } catch (error) {
          console.error('Message creation failed:', error);

          return {
            status: 'error',
            error: {
              code: 'MESSAGE_CREATION_FAILED',
              message: 'Failed to create message',
              details: error instanceof Error ? error.message : 'Unknown error',
              ...(process.env.NODE_ENV === 'development' && {
                debug: error instanceof Error ? error.stack : undefined,
              }),
            },
            timestamp: new Date().toISOString(),
          };
        }
      }),

    integrationsNotification: t.procedure
      .input(
        z.object({
          payload: z.record(z.unknown()),
          signature: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { subdomain } = ctx;

        try {
          const result = await receiveIntegrationsNotification(
            subdomain,
            input,
          );

          return {
            status: 'success',
            data: result,
            timestamp: new Date().toISOString(),
            message: 'Notification processed successfully',
          };
        } catch (error) {
          console.error('Integration notification failed:', error);

          return {
            status: 'error',
            error: {
              code: 'NOTIFICATION_PROCESSING_FAILED',
              message: 'Failed to process integration notification',
              details: error instanceof Error ? error.message : 'Unknown error',
              ...(process.env.NODE_ENV === 'development' && {
                debug: error instanceof Error ? error.stack : undefined,
              }),
            },
            timestamp: new Date().toISOString(),
            suggestion: 'Please verify the notification payload and try again',
          };
        }
      }),

    getConversations: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query = {} } = input;
        const { models } = ctx;

        try {
          const conversations = await models.Conversations.find(query).lean();
          return {
            status: 'success',
            data: conversations,
          };
        } catch (error) {
          console.error('Error fetching conversations:', {
            error: error instanceof Error ? error.message : String(error),
            query,
          });
          return {
            status: 'error',
            message: 'Failed to fetch conversations',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    removeCustomersConversations: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { customerIds } = input;
        const { models } = ctx;
        try {
          const result =
            await models.Conversations.removeCustomersConversations(
              customerIds,
            );

          return {
            status: 'success',
            deletedCount: result?.n ?? 0,
          };
        } catch (error) {
          console.error('Error removing conversations:', {
            error: error instanceof Error ? error.message : String(error),
            customerIds,
          });
          return {
            status: 'error',
            message: 'Failed to remove conversations',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    changeCustomer: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { customerId, customerIds } = input;
        const { models } = ctx;

        try {
          const result = await models.Conversations.changeCustomer(
            customerId,
            customerIds,
          );

          return {
            status: 'success',
            data: result,
          };
        } catch (error) {
          console.error('Error changing customer for conversations:', {
            error: error instanceof Error ? error.message : String(error),
            customerId,
            customerIds,
          });
          return {
            status: 'error',
            message: 'Failed to change customer for conversations',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    updateConversationMessage: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { filter, updateDoc } = input;
        const { models } = ctx;
        try {
          const updated = await models.ConversationMessages.updateOne(filter, {
            $set: updateDoc,
          });
          return {
            status: 'success',
            data: updated,
          };
        } catch (error) {
          console.error('Error updating conversation message:', {
            error: error instanceof Error ? error.message : String(error),
            filter,
            updateDoc,
          });
          return {
            status: 'error',
            message: 'Failed to update conversation message',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    removeConversation: t.procedure
      .input(
        z.object({
          _id: z.string().min(1, 'Conversation ID is required'),
          force: z.boolean().optional().default(false),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { models } = ctx;
        const { _id } = input;

        try {
          const messagesResult = await models.ConversationMessages.deleteMany({
            conversationId: _id,
          });
          const conversationResult = await models.Conversations.deleteOne({
            _id,
          });

          return {
            status: 'success',
            data: {
              conversationDeleted: conversationResult.deletedCount,
              messagesDeleted: messagesResult.deletedCount,
            },
            timestamp: new Date().toISOString(),
            message: `Deleted conversation and ${messagesResult.deletedCount} messages`,
          };
        } catch (error) {
          console.error('removeConversation failed:', {
            conversationId: _id,
            error: error instanceof Error ? error.stack : error,
          });

          return {
            status: 'error',
            error: {
              code: 'DELETION_FAILED',
              message: 'Failed to delete conversation',
              details:
                error instanceof Error ? error.message : 'Database error',
              conversationId: _id,
              ...(process.env.NODE_ENV === 'development' &&
              error instanceof Error
                ? { stack: error.stack }
                : {}),
            },
            timestamp: new Date().toISOString(),
          };
        }
      }),

    updateUserChannels: t.procedure
      .input(
        z.object({
          channelIds: z.array(z.string()),
          userId: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { channelIds, userId } = input;
        const { models } = ctx;

        try {
          const result = await models.Channels.updateUserChannels(
            channelIds,
            userId,
          );
          return {
            status: 'success',
            data: result,
          };
        } catch (error) {
          return {
            status: 'error',
            message: 'Failed to update user channels',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    getIntegrationKinds: t.procedure.input(z.any()).query(async () => {
      try {
        const data = await getIntegrationsKinds();
        return {
          status: 'success',
          data,
        };
      } catch (error) {
        console.error('Error fetching integration kinds:', {
          error: error instanceof Error ? error.message : String(error),
        });
        return {
          status: 'error',
          message: 'Failed to fetch integration kinds',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),

    getConversationsList: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query, listParams } = input;
        const { models } = ctx;

        const { list, totalCount, pageInfo } =
          await cursorPaginate<IConversationDocument>({
            model: models.Conversations,
            params: listParams,
            query: query,
          });

        return {
          status: 'success',
          data: { list, totalCount, pageInfo },
        };
      }),

    getModuleRelation: t.procedure.input(z.any()).query(async ({ input }) => {
      try {
        const { module, target } = input;
        let filter: { _id: string } | null = null;

        if (module.includes('contacts')) {
          const queryField = module.includes('company')
            ? target.companyId
            : target.customerId;

          if (!queryField) {
            return {
              status: 'error',
              message: `Missing ${
                module.includes('company') ? 'companyId' : 'customerId'
              } in target`,
            };
          }

          filter = { _id: queryField };
        }

        return {
          status: 'success',
          data: filter,
        };
      } catch (error) {
        console.error('Error generating module relation filter:', {
          error: error instanceof Error ? error.message : String(error),
          module,
        });
        return {
          status: 'error',
          message: 'Failed to generate module relation filter',
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }),

    sendNotifications: t.procedure
      .input(z.any()) // Consider replacing with proper input validation
      .mutation(async ({ ctx, input }) => {
        try {
          await sendNotifications(input);
          return {
            status: 'success',
            message: 'Notifications sent successfully',
          };
        } catch (error) {
          return {
            status: 'error',
            message: 'Failed to send notifications',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    conversationClientMessageInserted: t.procedure
      .input(z.any())
      .mutation(async ({ ctx, input }) => {
        const { models, subdomain } = ctx;
        try {
          const result = await pConversationClientMessageInserted(
            subdomain,
            input,
          );

          return {
            status: 'success',
            data: result,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error('Failed to insert client message:', error);
          return {
            status: 'error',
            message: 'Failed to process client message',
            error: error instanceof Error ? error.message : String(error),
          };
        }
      }),

    widgetsGetUnreadMessagesCount: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { conversationId } = input;
        const { models } = ctx;

        try {
          const unreadCount =
            await models.ConversationMessages.widgetsGetUnreadMessagesCount(
              conversationId,
            );

          return {
            status: 'success',
            data: {
              conversationId,
              unreadCount,
              lastChecked: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error('Failed to get unread messages count:', {
            conversationId,
            error: error instanceof Error ? error.message : error,
          });

          return {
            status: 'error',
            message: 'Failed to create message',
            error: {
              code: 'UNREAD_COUNT_FAILED',
              message: 'Failed to retrieve unread messages count',
              details:
                error instanceof Error ? error.message : 'Database error',
              conversationId,
            },
            timestamp: new Date().toISOString(),
            suggestion: 'Please try again or refresh the conversation',
          };
        }
      }),
  }),
});
