import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { renameOwnedThread, removeOwnedThread } from '@/session/nativeStore';

/** Resolve the logged-in user's _id, rejecting unauthenticated calls. */
function requireUserId(user: IUserDocument | null | undefined): string {
  if (!user?._id) throw new ExpectedError('Login required');
  return user._id;
}

/** Mutations on a user's own chat threads (rename / delete), Mastra-native. */
export const sessionMutations = {
  mastraThreadRename: async (
    _parent: undefined,
    { threadId, title }: { threadId: string; title: string },
    { user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsChat');
    return renameOwnedThread(subdomain, requireUserId(user), threadId, title);
  },

  mastraThreadRemove: async (
    _parent: undefined,
    { threadId }: { threadId: string },
    { user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsChat');
    return removeOwnedThread(subdomain, requireUserId(user), threadId);
  },
};
