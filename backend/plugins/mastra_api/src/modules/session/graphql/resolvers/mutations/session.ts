import { IContext } from '~/connectionResolvers';

export const sessionMutations = {
  mastraThreadRename: async (
    _: any,
    { threadId, title }: { threadId: string; title: string },
    { models }: IContext,
  ) => {
    return models.MastraThread.renameThread(threadId, title);
  },

  mastraThreadRemove: async (
    _: any,
    { threadId }: { threadId: string },
    { models }: IContext,
  ) => {
    return models.MastraThread.removeThread(threadId);
  },
};
