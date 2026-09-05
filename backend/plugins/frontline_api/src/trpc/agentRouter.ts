import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { IUserDocument } from 'erxes-api-shared/core-types';
import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { FrontlineTRPCContext } from '~/init-trpc';
import { generateFilter } from '@/ticket/utils/generateFilter';
import { agentMeta } from './agentMeta';

const t = initTRPC.context<FrontlineTRPCContext>().create();
type AgentContext = Awaited<ReturnType<FrontlineTRPCContext>>;
const id = z.string().trim().min(1).max(100);
const page = {
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).max(10000).default(0),
};
const conversationFilter = {
  integrationId: id.optional(),
  customerId: id.optional(),
  assignedUserId: id.optional(),
  status: z.enum(['new', 'open', 'closed', 'resolved']).optional(),
};
const conversationFields =
  '_id integrationId customerId assignedUserId status number messageCount createdAt updatedAt';

const procedure = (module: string, action: string, description: string) =>
  t.procedure
    .meta(agentMeta(description, { module, action }))
    .use(async ({ ctx, next }) => {
      if (!ctx.userId || !ctx.subdomain) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      const user: IUserDocument | null = await sendTRPCMessage({
        subdomain: ctx.subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        method: 'query',
        input: { query: { _id: ctx.userId } },
        defaultValue: null,
      });
      if (!user || user._id !== ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      await checkPermissionGroup(ctx.subdomain, user)(action);
      return next({ ctx: { ...ctx, user } });
    });

// Inbox visibility is membership-based, including for workspace owners.
const integrationScope = async (ctx: AgentContext) => {
  const channelIds = await ctx.models.ChannelMembers.find({
    memberId: ctx.userId,
  }).distinct('channelId');
  const integrations = await ctx.models.Integrations.find({
    channelId: { $in: channelIds },
    isActive: { $ne: false },
  }).distinct('_id');
  return { integrationId: { $in: integrations } };
};

const requireConversation = async (
  ctx: AgentContext,
  conversationId: string,
) => {
  const scope = await integrationScope(ctx);
  const conversation = await ctx.models.Conversations.findOne({
    _id: conversationId,
    ...scope,
  })
    .select(conversationFields)
    .lean();
  if (!conversation) throw new TRPCError({ code: 'NOT_FOUND' });
  return conversation;
};

export const frontlineAgentRouter = t.router({
  agent: t.router({
    conversations: procedure(
      'inbox',
      'showConversations',
      'List visible inbox conversations. Use offset and limit to page; use conversation for one record and messages for its text.',
    )
      .input(z.object({ ...conversationFilter, ...page }).strict())
      .query(async ({ ctx, input: { limit, offset, ...filter } }) => {
        const scope = await integrationScope(ctx);
        return ctx.models.Conversations.find({ $and: [scope, filter] })
          .select(conversationFields)
          .sort({ updatedAt: -1, _id: -1 })
          .skip(offset)
          .limit(limit)
          .lean();
      }),
    conversationCount: procedure(
      'inbox',
      'showConversations',
      'Count inbox conversations visible to the acting user with optional status, customer, integration or assignee filters.',
    )
      .input(z.object(conversationFilter).strict())
      .query(async ({ ctx, input }) =>
        ctx.models.Conversations.countDocuments({
          $and: [await integrationScope(ctx), input],
        }),
      ),
    conversation: procedure(
      'inbox',
      'showConversations',
      'Get one visible inbox conversation by its ID. Read its messages separately.',
    )
      .input(z.object({ conversationId: id }).strict())
      .query(({ ctx, input }) =>
        requireConversation(ctx, input.conversationId),
      ),
    messages: procedure(
      'inbox',
      'showConversations',
      'Read a page of inbox messages for a visible conversation, newest first. Provider-specific mail and call records are not included.',
    )
      .input(z.object({ conversationId: id, ...page }).strict())
      .query(async ({ ctx, input }) => {
        await requireConversation(ctx, input.conversationId);
        return ctx.models.ConversationMessages.find({
          conversationId: input.conversationId,
        })
          .select('_id conversationId content createdAt userId customerId')
          .sort({ createdAt: -1, _id: -1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();
      }),
    integrations: procedure(
      'integration',
      'showIntegrations',
      'List active integrations in channels the acting user belongs to. Returns identifiers and labels without integration credentials.',
    )
      .input(z.object({ kind: id.optional(), ...page }).strict())
      .query(async ({ ctx, input }) => {
        const scope = await integrationScope(ctx);
        return ctx.models.Integrations.find({
          _id: scope.integrationId,
          ...(input.kind ? { kind: input.kind } : {}),
        })
          .select('_id name kind channelId brandId isActive')
          .sort({ _id: 1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();
      }),
    channels: procedure(
      'channel',
      'showChannels',
      'List channels the acting user belongs to, including their own personal inbox.',
    )
      .input(z.object(page).strict())
      .query(async ({ ctx, input }) => {
        const channelIds = await ctx.models.ChannelMembers.find({
          memberId: ctx.userId,
        }).distinct('channelId');
        return ctx.models.Channels.find({ _id: { $in: channelIds } })
          .select('_id name scope')
          .sort({ _id: 1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();
      }),
    tickets: procedure(
      'ticket',
      'showTickets',
      'List tickets with the same pipeline and status visibility rules as the ticket list. Optionally filter by pipeline, status, or literal search text.',
    )
      .input(
        z
          .object({
            pipelineId: id.optional(),
            statusId: id.optional(),
            searchValue: z.string().max(100).optional(),
            ...page,
          })
          .strict(),
      )
      .query(async ({ ctx, input }) => {
        const filter = await generateFilter(input, ctx.user, ctx.models);
        const channels = await ctx.models.ChannelMembers.find({
          memberId: ctx.userId,
        }).distinct('channelId');
        return ctx.models.Ticket.find({
          $and: [filter, { channelId: { $in: channels } }],
        })
          .select(
            '_id name number channelId pipelineId statusId assigneeId priority state createdAt updatedAt',
          )
          .sort({ updatedAt: -1, _id: -1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();
      }),
    formSubmissions: procedure(
      'form',
      'showFormSubmissions',
      'Read a page of form submission fields attached to a conversation visible to the acting user.',
    )
      .input(z.object({ conversationId: id, ...page }).strict())
      .query(async ({ ctx, input }) => {
        await requireConversation(ctx, input.conversationId);
        return ctx.models.FormSubmissions.find({
          conversationId: input.conversationId,
        })
          .select('_id formId formFieldId value submittedAt')
          .sort({ _id: 1 })
          .skip(input.offset)
          .limit(input.limit)
          .lean();
      }),
    articles: procedure(
      'knowledgeBase',
      'showKnowledgeBase',
      'List published, non-private knowledge base article summaries. Filter by topic or category and page with offset.',
    )
      .input(
        z
          .object({
            topicId: id.optional(),
            categoryId: id.optional(),
            ...page,
          })
          .strict(),
      )
      .query(({ ctx, input: { limit, offset, ...filter } }) =>
        ctx.models.Article.find({
          ...filter,
          status: 'publish',
          isPrivate: { $ne: true },
        })
          .select('_id title summary code topicId categoryId')
          .sort({ _id: 1 })
          .skip(offset)
          .limit(limit)
          .lean(),
      ),
  }),
});
