import { IContext } from '~/connectionResolvers';

export const sessionQueries = {
  mastraThreads: async (
    _: any,
    { agentId }: { agentId: string },
    { models }: IContext,
  ) => {
    return models.MastraThread.getThreadsByAgent(agentId);
  },

  mastraThreadMessages: async (
    _: any,
    { threadId }: { threadId: string },
    { models }: IContext,
  ) => {
    return models.MastraMessage.getMessages(threadId);
  },
};
