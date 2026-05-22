import { IEngageData } from '@/inbox/@types/conversationMessages';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import {
  receiveInboxMessage,
  receiveIntegrationsNotification,
} from '@/inbox/receiveMessage';
import { getIntegrationsKinds } from '@/inbox/utils';
import { initTRPC } from '@trpc/server';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { z } from 'zod';
import { IModels } from '~/connectionResolvers';
import { FrontlineTRPCContext } from '~/init-trpc';
import { IConversationDocument } from '../@types/conversations';
const t = initTRPC.context<FrontlineTRPCContext>().create();
const unwrapRPResult = (result: any) => {
  if (result?.status === 'error') {
    throw new Error(result.errorMessage || 'TRPC error');
  }

  return result?.status === 'success' ? result.data ?? null : result;
};
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
export const createConversationAndMessage = async (
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
      return unwrapRPResult(result);
    } catch (error) {
      throw new Error('TRPC error');
    }
  }),
  remove: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { _id } = input;
    if (!_id) {
      throw new Error('TRPC error');
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
      throw new Error('TRPC error');
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
      return integrations;
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      throw new Error('TRPC error');
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
        return integration;
      } catch (error) {
        console.error('Failed to copy lead integration:', error);
        throw new Error('TRPC error');
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
      return count;
    } catch (error) {
      console.error('Count operation failed:', error);
      throw new Error('TRPC error');
    }
  }),
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    const { models } = ctx;
    try {
      const result = await models.Integrations.findOne(input).lean();
      if (!result) {
        throw new Error('TRPC error');
      }
      return result;
    } catch (error) {
      console.error('FindOne operation failed:', error);
      throw new Error('TRPC error');
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
        throw new Error('TRPC error');
      }
      return message;
    } catch (error) {
      console.error('Failed to find conversation message:', error);
      throw new Error('TRPC error');
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
        return result;
      }
      const result = await models.ConversationMessages.find(input).lean();
      return result;
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      throw new Error('Failed to fetch conversation messages');
    }
  }),
  updateOne: t.procedure.input(z.any()).mutation(async ({ ctx, input }) => {
    const { filter, updateDoc } = input;
    const { models } = ctx;
    if (!filter || !Object.keys(filter).length) {
      return {};
    }
    return await models.ConversationMessages.updateOne(filter, {
      $set: updateDoc,
    });
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
      return count;
    } catch (error) {
      console.error('Count documents error:', error);
      throw new Error('Failed to count documents');
    }
  }),
  findOne: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const { query } = input;
      const { models } = ctx;
      if (!query) {
        throw new Error('Query parameter is required');
      }
      const conversation = await models.Conversations.findOne(query).lean();
      if (!conversation) {
        return null;
      }
      return conversation;
    } catch (error) {
      console.error('Error finding conversation:', error);
      throw new Error('Failed to find conversation');
    }
  }),
  changeStatus: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
    try {
      const { id, status } = input;
      const { models } = ctx;
      if (!id || !status) {
        throw new Error(
          `Both id and status are required. Received id: ${id}, status: ${status}`,
        );
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
      return result;
    } catch (error) {
      console.error('Update error:', error);
      throw new Error('Update failed');
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
      return null;
    } catch (error) {
      console.error('channels query error:', error);
      throw new Error('Failed to fetch channels');
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
          return response;
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
          throw new Error('TRPC error');
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
          return message;
        } catch (error) {
          console.error('Message creation failed:', error);
          throw new Error('TRPC error');
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
          return unwrapRPResult(result);
        } catch (error) {
          console.error('Integration notification failed:', error);
          throw new Error('TRPC error');
        }
      }),
    getConversations: t.procedure
      .input(z.any())
      .query(async ({ ctx, input }) => {
        const { query = {} } = input;
        const { models } = ctx;
        try {
          const conversations = await models.Conversations.find(query).lean();
          return conversations;
        } catch (error) {
          console.error('Error fetching conversations:', {
            error: error instanceof Error ? error.message : String(error),
            query,
          });
          throw new Error('Failed to fetch conversations');
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
          return null;
        } catch (error) {
          console.error('Error removing conversations:', {
            error: error instanceof Error ? error.message : String(error),
            customerIds,
          });
          throw new Error('Failed to remove conversations');
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
          return result;
        } catch (error) {
          console.error('Error changing customer for conversations:', {
            error: error instanceof Error ? error.message : String(error),
            customerId,
            customerIds,
          });
          throw new Error('Failed to change customer for conversations');
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
          return updated;
        } catch (error) {
          console.error('Error updating conversation message:', {
            error: error instanceof Error ? error.message : String(error),
            filter,
            updateDoc,
          });
          throw new Error('Failed to update conversation message');
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
            conversationDeleted: conversationResult.deletedCount,
            messagesDeleted: messagesResult.deletedCount,
          };
        } catch (error) {
          console.error('removeConversation failed:', {
            conversationId: _id,
            error: error instanceof Error ? error.stack : error,
          });
          throw new Error('TRPC error');
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
          return result;
        } catch (error) {
          throw new Error('Failed to update user channels');
        }
      }),
    getIntegrationKinds: t.procedure.input(z.any()).query(async () => {
      try {
        const data = await getIntegrationsKinds();
        return null;
      } catch (error) {
        console.error('Error fetching integration kinds:', {
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error('Failed to fetch integration kinds');
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
        return { list, totalCount, pageInfo };
      }),
    getModuleRelation: t.procedure.input(z.any()).query(async ({ input }) => {
      try {
        const { module, target } = input;
        let filter: {
          _id: string;
        } | null = null;
        if (module.includes('contacts')) {
          const queryField = module.includes('company')
            ? target.companyId
            : target.customerId;
          if (!queryField) {
            throw new Error(
              `Missing ${
                module.includes('company') ? 'companyId' : 'customerId'
              } in target`,
            );
          }
          filter = { _id: queryField };
        }
        return filter;
      } catch (error) {
        console.error('Error generating module relation filter:', {
          error: error instanceof Error ? error.message : String(error),
          module,
        });
        throw new Error('Failed to generate module relation filter');
      }
    }),
    sendNotifications: t.procedure
      .input(z.any()) // Consider replacing with proper input validation
      .mutation(async ({ ctx, input }) => {
        const { subdomain } = ctx;
        try {
          await sendNotifications(subdomain, input);
          return null;
        } catch (error) {
          throw new Error('Failed to send notifications');
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
          return result;
        } catch (error) {
          console.error('Failed to insert client message:', error);
          throw new Error('Failed to process client message');
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
            conversationId,
            unreadCount,
            lastChecked: new Date().toISOString(),
          };
        } catch (error) {
          console.error('Failed to get unread messages count:', {
            conversationId,
            error: error instanceof Error ? error.message : error,
          });
          throw new Error('Failed to create message');
        }
      }),
  }),
});
