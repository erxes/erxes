import { IUserDocument } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { renameOwnedThread, removeOwnedThread } from '@/session/nativeStore';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
function requireUserId(user: IUserDocument | null | undefined): string {
  if (!user?._id) throw new Error('Login required');
  return user._id;
}

/** Mutations on a user's own chat threads (rename / delete), Mastra-native. */
export const sessionMutations = {
  mastraThreadRename: (
    _parent: undefined,
    { threadId, title }: { threadId: string; title: string },
    { user, subdomain }: IContext,
  ) => {
    return renameOwnedThread(subdomain, requireUserId(user), threadId, title);
  },

  mastraThreadRemove: (
    _parent: undefined,
    { threadId }: { threadId: string },
    { user, subdomain }: IContext,
  ) => {
    return removeOwnedThread(subdomain, requireUserId(user), threadId);
  },
};
