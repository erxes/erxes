import * as z from 'zod';
import { defineContract } from '../define';

// Schema nullability follows the GraphQL SDL: lists and their items are
// nullable there, so they are nullable here too.
const IdList = z.array(z.string()).nullable();

const ListOf = <T extends z.ZodType>(item: T) => z.array(item).nullable();

const PageInfo = z.object({
  hasNextPage: z.boolean().nullable(),
  endCursor: z.string().nullable(),
});

const pageOf = <T extends z.ZodType>(item: T) =>
  z
    .object({
      list: ListOf(item),
      totalCount: z.number().nullable(),
      pageInfo: PageInfo.nullable(),
    })
    .nullable();

const ConversationSummary = z.object({
  _id: z.string(),
  integrationId: z.string().nullable(),
  customerId: z.string().nullable(),
  assignedUserId: z.string().nullable(),
  participatedUserIds: IdList,
  status: z.string().nullable(),
  messageCount: z.number().nullable(),
  tagIds: IdList,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

const MessageSummary = z.object({
  _id: z.string(),
  content: z.string().nullable(),
  conversationId: z.string().nullable(),
  internal: z.boolean().nullable(),
  userId: z.string().nullable(),
  customerId: z.string().nullable(),
  mentionedUserIds: IdList,
  createdAt: z.string().nullable(),
});

const ChannelSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  scope: z.string().nullable(),
  memberCount: z.number(),
  conversationCount: z.number(),
  createdAt: z.string().nullable(),
});

const ResponseTemplateSummary = z.object({
  _id: z.string(),
  name: z.string().nullable(),
  content: z.string().nullable(),
  channelId: z.string().nullable(),
  files: IdList,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

// Integration config and credentials (details, messengerData, webhookData,
// leadData, uiOptions, callData) are never selected.
const IntegrationSummary = z.object({
  _id: z.string(),
  kind: z.string().nullable(),
  name: z.string().nullable(),
  brandId: z.string().nullable(),
  channelId: z.string().nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.string().nullable(),
});

export const frontlineInboxContract = defineContract('frontline', 1, [
  {
    name: 'conversations.list',
    description:
      'List conversations in the inbox, most recently updated first, 20 per page unless limit is set (max 50). Pass pageInfo.endCursor as cursor to get the next page. status "open" (the default) returns new and open conversations; "closed" returns closed ones. channelId limits results to one channel. Read-only.',
    kind: 'read',
    field: 'conversations',
    args: {
      channelId: 'String',
      integrationId: 'String',
      status: 'String',
      searchValue: 'String',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({
        channelId: z.string().min(1).optional(),
        integrationId: z.string().min(1).optional(),
        status: z.enum(['open', 'closed']).optional(),
        searchValue: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: pageOf(ConversationSummary),
  },
  {
    name: 'conversations.count',
    description:
      'Count the conversations that conversations.list would return with the same filters. Pagination is not applied. Read-only.',
    kind: 'read',
    field: 'conversationsTotalCount',
    args: {
      channelId: 'String',
      integrationId: 'String',
      status: 'String',
      searchValue: 'String',
    },
    input: z
      .object({
        channelId: z.string().min(1).optional(),
        integrationId: z.string().min(1).optional(),
        status: z.enum(['open', 'closed']).optional(),
        searchValue: z.string().optional(),
      })
      .strict(),
    output: z.number().nullable(),
  },
  {
    name: 'conversations.get',
    description:
      'Read one conversation by its _id. Returns null when no conversation has that _id. Read-only.',
    kind: 'read',
    field: 'conversationDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ConversationSummary.nullable(),
  },
  {
    name: 'conversations.assign',
    description:
      'Assign one or more conversations to a user, replacing the current assignee. The assignee gets a notification unless it is the caller. Returns the updated conversations.',
    kind: 'write',
    field: 'conversationsAssign',
    args: { conversationIds: '[String]!', assignedUserId: 'String' },
    input: z
      .object({
        conversationIds: z.array(z.string().min(1)).min(1),
        assignedUserId: z.string().min(1),
      })
      .strict(),
    output: ListOf(ConversationSummary),
  },
  {
    name: 'conversations.changeStatus',
    description:
      'Set the status of one or more conversations to new, open, or closed. Closing also records the caller and the close time. Returns the updated conversations.',
    kind: 'write',
    field: 'conversationsChangeStatus',
    args: { _ids: '[String]!', status: 'String!' },
    input: z
      .object({
        _ids: z.array(z.string().min(1)).min(1),
        status: z.enum(['new', 'open', 'closed']),
      })
      .strict(),
    output: ListOf(ConversationSummary),
  },
  {
    name: 'messages.list',
    description:
      'List messages in one conversation, oldest first. Without limit, returns the newest 50. With limit, returns that many messages, and skip counts back from the newest message. Read-only.',
    kind: 'read',
    field: 'conversationMessages',
    args: { conversationId: 'String!', skip: 'Int', limit: 'Int' },
    input: z
      .object({
        conversationId: z.string().min(1),
        skip: z.number().int().min(0).optional(),
        limit: z.number().int().min(1).max(50).optional(),
      })
      .strict(),
    output: ListOf(MessageSummary),
  },
  {
    name: 'messages.create',
    description:
      "Post a message in a conversation as the caller. internal true saves a note that only the team sees, and mentionedUserIds notifies those users. internal false sends a reply to the customer through the conversation's integration. The conversation must have a customer, except Telegram chats. Fails when the caller cannot send messages. Returns the saved message.",
    kind: 'write',
    field: 'conversationMessageAdd',
    args: {
      conversationId: 'String!',
      content: 'String',
      internal: 'Boolean',
      mentionedUserIds: '[String]',
    },
    input: z
      .object({
        conversationId: z.string().min(1),
        content: z.string().min(1),
        internal: z.boolean(),
        mentionedUserIds: z.array(z.string().min(1)).optional(),
      })
      .strict(),
    output: MessageSummary.nullable(),
  },
  {
    name: 'channels.list',
    description:
      'List the team channels the caller is a member of, filtered by name and sorted by name or createdAt. Read-only.',
    kind: 'read',
    field: 'getMyChannels',
    args: { name: 'String', sortField: 'String', sortDirection: 'Int' },
    input: z
      .object({
        name: z.string().optional(),
        sortField: z.enum(['name', 'createdAt']).optional(),
        sortDirection: z.union([z.literal(1), z.literal(-1)]).optional(),
      })
      .strict(),
    output: ListOf(ChannelSummary),
  },
  {
    name: 'channels.get',
    description:
      'Read one channel by its _id. Only members of the channel, and users who can see all channels, can read it. Read-only.',
    kind: 'read',
    field: 'getChannel',
    args: { _id: 'String!' },
    notFound: 'Channel not found',
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ChannelSummary.nullable(),
  },
  {
    name: 'responseTemplates.list',
    description:
      'List canned response templates. channelId limits results to one channel. searchValue matches the name or content, case-insensitive. Pages hold up to 50 items; pass pageInfo.endCursor as cursor for the next page. Read-only.',
    kind: 'read',
    field: 'responseTemplates',
    args: { filter: 'ResponseTemplatesFilter' },
    input: z
      .object({
        filter: z
          .object({
            channelId: z.string().min(1).optional(),
            searchValue: z.string().optional(),
            limit: z.number().int().min(1).max(50).optional(),
            cursor: z.string().optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
    output: pageOf(ResponseTemplateSummary),
  },
  {
    name: 'responseTemplates.get',
    description:
      'Read one canned response template by its _id. Returns null when no template has that _id. Read-only.',
    kind: 'read',
    field: 'responseTemplate',
    args: { _id: 'String' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ResponseTemplateSummary.nullable(),
  },
  {
    name: 'responseTemplates.create',
    description:
      'Create a canned response template in a channel. name and channelId are required. files are file ids. Returns the new template.',
    kind: 'write',
    field: 'responseTemplatesAdd',
    args: {
      name: 'String!',
      content: 'String',
      channelId: 'String!',
      files: '[String]',
    },
    input: z
      .object({
        name: z.string().min(1),
        content: z.string().optional(),
        channelId: z.string().min(1),
        files: z.array(z.string()).optional(),
      })
      .strict(),
    output: ResponseTemplateSummary.nullable(),
  },
  {
    name: 'responseTemplates.edit',
    description:
      'Update a canned response template. Fields left out keep their current value. Returns the updated template, or null when no template has that _id.',
    kind: 'write',
    field: 'responseTemplatesEdit',
    args: {
      _id: 'String!',
      name: 'String!',
      content: 'String',
      channelId: 'String',
      files: '[String]',
    },
    input: z
      .object({
        _id: z.string().min(1),
        name: z.string().min(1),
        content: z.string().optional(),
        channelId: z.string().min(1).optional(),
        files: z.array(z.string()).optional(),
      })
      .strict(),
    output: ResponseTemplateSummary.nullable(),
  },
  {
    name: 'responseTemplates.remove',
    description:
      'Delete one canned response template by its _id. Fails when no template has that _id. Returns the deleted template.',
    kind: 'destructive',
    field: 'responseTemplatesRemove',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: ResponseTemplateSummary.nullable(),
  },
  {
    name: 'integrations.list',
    description:
      'List the integrations (inboxes) in one channel that the caller can see, with name, kind, and brandId. Does not return credentials or configuration. Pages hold up to 50 items; pass pageInfo.endCursor as cursor for the next page. Read-only.',
    kind: 'read',
    field: 'integrations',
    args: {
      channelId: 'String!',
      searchValue: 'String',
      limit: 'Int',
      cursor: 'String',
    },
    input: z
      .object({
        channelId: z.string().min(1),
        searchValue: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional(),
      })
      .strict(),
    output: pageOf(IntegrationSummary),
  },
  {
    name: 'integrations.get',
    description:
      'Read one integration by its _id, with name, kind, and brandId. Returns null when no integration has that _id. Does not return credentials or configuration. Read-only.',
    kind: 'read',
    field: 'integrationDetail',
    args: { _id: 'String!' },
    input: z.object({ _id: z.string().min(1) }).strict(),
    output: IntegrationSummary.nullable(),
  },
]);
