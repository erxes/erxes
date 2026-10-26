import { migrateLegacyPageSelections } from '@/agents/pageSelections';
import { ExpectedError } from 'erxes-api-shared/utils';
import type { MastraMemory } from '@mastra/core/memory' with {
  'resolution-mode': 'import',
};

import { getAgentsMemory } from '@/agents/memory';
import type { IContext } from '~/connectionResolvers';

const DEFAULT_PER_PAGE = 50;
const MAX_PER_PAGE = 100;

export interface IAgentsThreadsArgs {
  page?: number;
  perPage?: number;
  pinned?: boolean;
}

export interface IAgentsThreadDetailArgs {
  threadId: string;
}

/**
 * Parses and clamps the GraphQL pagination arguments. The API is 1-based
 * (`page: 1` is the first page, the default); Mastra's `listThreads` page is
 * 0-based, so the conversion happens here before the memory layer.
 */
const parseThreadPagination = (
  args: IAgentsThreadsArgs,
): { page: number; perPage: number } => {
  const page = Math.max(1, args.page ?? 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, args.perPage ?? DEFAULT_PER_PAGE),
  );

  return { page, perPage };
};

/** Maps a Mastra thread to the public shape, stripping internal fields. */
const toPublicThread = (thread: {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}) => ({
  id: thread.id,
  title: thread.title,
  pinned: thread.metadata?.pinned === true,
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});

export const agentsThreadsQueries = {
  /**
   * Lists the acting user's agents threads, newest activity first. Ownership
   * is enforced by filtering on the acting user id (`filter.resourceId`), so
   * no other user's threads can ever be returned.
   */
  agentsThreads: async (
    _parent: undefined,
    args: IAgentsThreadsArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('showAgents');

    const { page, perPage } = parseThreadPagination(args);
    const memory = await getAgentsMemory(ctx.subdomain);
    const result = await memory.listThreads({
      page: page - 1,
      perPage,
      orderBy: { field: 'updatedAt', direction: 'DESC' },
      filter: {
        resourceId: ctx.user._id,
        // MongoDBStore maps filter.metadata keys to `metadata.<key>`
        // predicates natively (verified in @mastra/mongodb 1.22).
        ...(args.pinned === true ? { metadata: { pinned: true } } : {}),
      },
    });

    return {
      threads: result.threads.map(toPublicThread),
      total: result.total,
      page,
      perPage,
      hasMore: result.hasMore,
    };
  },

  /**
   * Loads one thread's stored messages. Reads only; the thread must exist and
   * belong to the acting user, otherwise the error masks whether the thread
   * exists at all for other users.
   */
  agentsThreadDetail: async (
    _parent: undefined,
    { threadId }: IAgentsThreadDetailArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('showAgents');

    const memory: MastraMemory = await getAgentsMemory(ctx.subdomain);
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      throw new ExpectedError('Thread not found.', 'NOT_FOUND');
    }

    if (thread.resourceId !== ctx.user._id) {
      throw new ExpectedError(
        'Thread belongs to another user.',
        'FORBIDDEN',
      );
    }

    const result = await memory.recall({
      threadId: thread.id,
      page: 0,
      perPage: MAX_PER_PAGE,
    });

    return {
      thread: toPublicThread(thread),
      messages: result.messages.map((message) => ({
        id: message.id,
        role: message.role,
        createdAt: message.createdAt,
        content:
          message.role === 'user' && Array.isArray(message.content.parts)
            ? {
                ...message.content,
                parts: migrateLegacyPageSelections(message.content.parts),
              }
            : message.content,
      })),
    };
  },
};
