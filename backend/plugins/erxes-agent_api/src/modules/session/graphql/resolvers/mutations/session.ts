import { IUserDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
function requireUserId(user: IUserDocument | null | undefined): string {
  if (!user?._id) throw new Error('Login required');
  return user._id;
}

/** Mutations on a user's own chat threads (rename / delete). */
export const sessionMutations = {
  mastraThreadRename: (
    _parent: undefined,
    { threadId, title }: { threadId: string; title: string },
    { models, user }: IContext,
  ) => {
    return models.MastraThread.renameThread(
      threadId,
      title,
      requireUserId(user),
    );
  },

  mastraThreadRemove: (
    _parent: undefined,
    { threadId }: { threadId: string },
    { models, user }: IContext,
  ) => {
    return models.MastraThread.removeThread(threadId, requireUserId(user));
  },
};
