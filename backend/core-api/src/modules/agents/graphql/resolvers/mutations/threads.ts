import { ExpectedError } from 'erxes-api-shared/utils';
import type { MastraMemory } from '@mastra/core/memory' with {
  'resolution-mode': 'import',
};

import { getAgentsMemory, getAgentsRuntime } from '@/agents/memory';
import { publishAgentsThreadsChanged } from '@/agents/threadsEvents';
import type { IContext } from '~/connectionResolvers';

export interface IAgentsThreadRemoveArgs {
  threadId: string;
}

export interface IAgentsThreadUpdateArgs {
  threadId: string;
  title?: string;
  pinned?: boolean;
}

const TITLE_MAX_LENGTH = 120;

/** C0 control chars + DEL — lint forbids control chars in regex literals. */
const hasControlCharacters = (value: string): boolean =>
  [...value].some((char) => {
    const code = char.charCodeAt(0);
    return code < 32 || code === 127;
  });

/**
 * Loads a thread and proves the acting user owns it. Both failures use the
 * same messages as `agentsThreadRemove`, so cross-user probing never learns
 * whether a thread exists.
 */
const requireOwnedThread = async (
  memory: MastraMemory,
  threadId: string,
  userId: string,
) => {
  const thread = await memory.getThreadById({ threadId });

  if (!thread) {
    throw new ExpectedError('Thread not found.', 'NOT_FOUND');
  }

  if (thread.resourceId !== userId) {
    throw new ExpectedError('Thread belongs to another user.', 'FORBIDDEN');
  }

  return thread;
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

export const agentsThreadMutations = {
  /**
   * Renames and/or pins one of the acting user's threads. The same
   * not-found / foreign-thread errors as `agentsThreadRemove` apply. At
   * least one field is required; metadata is merged (never replaced) so
   * unrelated keys survive a pin toggle. Publishes the standard refresh
   * signal on success.
   */
  agentsThreadUpdate: async (
    _p: undefined,
    { threadId, title, pinned }: IAgentsThreadUpdateArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    if (title === undefined && pinned === undefined) {
      throw new ExpectedError(
        'Provide a title and/or pinned to update.',
        'BAD_USER_INPUT',
      );
    }

    let trimmedTitle: string | undefined;

    if (title !== undefined) {
      trimmedTitle = title.trim();

      if (
        trimmedTitle.length < 1 ||
        trimmedTitle.length > TITLE_MAX_LENGTH ||
        hasControlCharacters(trimmedTitle)
      ) {
        throw new ExpectedError(
          'Title must be 1-120 characters without control characters.',
          'BAD_USER_INPUT',
        );
      }
    }

    const memory: MastraMemory = await getAgentsMemory(ctx.subdomain);
    const thread = await requireOwnedThread(memory, threadId, ctx.user._id);

    const updated = await memory.updateThread({
      id: threadId,
      title: trimmedTitle ?? thread.title,
      metadata: {
        ...(thread.metadata ?? {}),
        ...(pinned !== undefined ? { pinned } : {}),
      },
    });

    publishAgentsThreadsChanged(ctx.user._id);

    return toPublicThread(updated);
  },

  /**
   * Deletes one of the acting user's agents threads. The thread must exist
   * and belong to the acting user; the ownership error masks whether the
   * thread exists at all for other users. Publishes the standard refresh
   * signal so the sidebar refetches without a manual reload.
   */
  agentsThreadRemove: async (
    _p: undefined,
    { threadId }: IAgentsThreadRemoveArgs,
    ctx: IContext,
  ) => {
    await ctx.checkPermission('agentsChat');

    const memory: MastraMemory = await getAgentsMemory(ctx.subdomain);
    const thread = await memory.getThreadById({ threadId });

    if (!thread) {
      throw new ExpectedError('Thread not found.', 'NOT_FOUND');
    }

    if (thread.resourceId !== ctx.user._id) {
      throw new ExpectedError('Thread belongs to another user.', 'FORBIDDEN');
    }

    // Closing a session is also an explicit stop. Cancel its native runs before
    // removing memory so a late completion cannot recreate the conversation.
    const { agent } = await getAgentsRuntime(ctx.subdomain);
    const scope = { threadId, resourceId: ctx.user._id };
    const [active, suspended] = await Promise.all([
      agent.listActiveRuns(scope), agent.listSuspendedRuns(scope),
    ]);
    const runIds = new Set([...active.runs, ...suspended.runs].map((run) => run.runId));
    for (const runId of runIds) {
      agent.abortRunStream(runId);
      const run = await agent.getWorkflow().createRun({ runId });
      await run.cancel();
    }
    await memory.deleteThread(threadId);

    publishAgentsThreadsChanged(ctx.user._id);

    return true;
  },
};
