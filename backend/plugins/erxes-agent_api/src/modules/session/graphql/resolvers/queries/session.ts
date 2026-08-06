import { IUserDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

// Threads are private: every query requires a logged-in user and is filtered
// to threads that user owns. Bot threads (userId "bot:*") never match.
function requireUserId(user: IUserDocument | null | undefined): string {
  if (!user?._id) throw new Error('Login required');
  return user._id;
}

/** Queries over a user's own chat threads and their transcripts. */
export const sessionQueries = {
  mastraThreads: (
    _parent: undefined,
    { agentId }: { agentId: string },
    { models, user }: IContext,
  ) => {
    return models.MastraThread.getThreadsByOwner(agentId, requireUserId(user));
  },

  mastraThreadMessages: async (
    _parent: undefined,
    { threadId }: { threadId: string },
    { models, user }: IContext,
  ) => {
    // Ownership check first — reading another user's transcript is the leak
    // this guards against.
    await models.MastraThread.getOwnedThread(threadId, requireUserId(user));
    return models.MastraMessage.getMessages(threadId);
  },
};
