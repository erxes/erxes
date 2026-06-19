import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  listOwnedThreads,
  getOwnedThreadMessages,
} from '@/session/nativeStore';

// Threads are private: every query requires a logged-in user and is filtered
// to threads that user owns. Ownership + tenant isolation is by the native
// thread's resourceId (scopedResource(subdomain, userId)); bot threads
// (resource "<sub>:bot:*") never match.
function requireUserId(user: IUserDocument | null | undefined): string {
  if (!user?._id) throw new ExpectedError('Login required');
  return user._id;
}

/** Queries over a user's own chat threads and their transcripts (Mastra-native). */
export const sessionQueries = {
  mastraThreads: async (
    _parent: undefined,
    { agentId }: { agentId: string },
    { user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsChat');
    return listOwnedThreads(subdomain, requireUserId(user), agentId);
  },

  mastraThreadMessages: async (
    _parent: undefined,
    { threadId }: { threadId: string },
    { user, subdomain, checkPermission }: IContext,
  ) => {
    await checkPermission('agentsChat');
    // Ownership is enforced inside (resourceId scope) — reading another user's
    // transcript reads back as "Thread not found".
    return getOwnedThreadMessages(subdomain, requireUserId(user), threadId);
  },
};
