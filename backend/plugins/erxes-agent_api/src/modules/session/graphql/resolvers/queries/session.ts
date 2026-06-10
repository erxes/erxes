import { IContext } from '~/connectionResolvers';

// Threads are private: every query requires a logged-in user and is filtered
// to threads that user owns. Bot threads (userId "bot:*") never match.
function requireUserId(user: any): string {
  if (!user?._id) throw new Error('Login required');
  return user._id;
}

export const sessionQueries = {
  mastraThreads: async (
    _: any,
    { agentId }: { agentId: string },
    { models, user }: IContext,
  ) => {
    return models.MastraThread.getThreadsByOwner(agentId, requireUserId(user));
  },

  mastraThreadMessages: async (
    _: any,
    { threadId }: { threadId: string },
    { models, user }: IContext,
  ) => {
    // Ownership check first — reading another user's transcript is the leak
    // this guards against.
    await models.MastraThread.getOwnedThread(threadId, requireUserId(user));
    return models.MastraMessage.getMessages(threadId);
  },
};
