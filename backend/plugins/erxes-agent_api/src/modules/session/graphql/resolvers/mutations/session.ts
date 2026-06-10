import { IContext } from '~/connectionResolvers';

function requireUserId(user: any): string {
  if (!user?._id) throw new Error('Login required');
  return user._id;
}

export const sessionMutations = {
  mastraThreadRename: async (
    _: any,
    { threadId, title }: { threadId: string; title: string },
    { models, user }: IContext,
  ) => {
    return models.MastraThread.renameThread(threadId, title, requireUserId(user));
  },

  mastraThreadRemove: async (
    _: any,
    { threadId }: { threadId: string },
    { models, user }: IContext,
  ) => {
    return models.MastraThread.removeThread(threadId, requireUserId(user));
  },
};
