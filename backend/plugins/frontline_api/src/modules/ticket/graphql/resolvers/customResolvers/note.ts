import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { isClientPortalAuthor } from '@/ticket/db/models/Note';
import { IContext } from '~/connectionResolvers';

type TCpUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  avatar?: string;
};

const buildFullName = (cpUser: TCpUser) =>
  [cpUser.firstName, cpUser.lastName].filter(Boolean).join(' ') ||
  cpUser.username ||
  cpUser.email ||
  '';

export const Note = {
  /**
   * `createdBy` holds `cp:<erxesCustomerId | cpUserId>` for portal authors and
   * a plain erxes user id for team members, which the UI resolves itself.
   */
  async clientPortalAuthor(
    { createdBy }: { createdBy?: string },
    _params: undefined,
    { subdomain }: IContext,
  ) {
    if (!isClientPortalAuthor(createdBy)) {
      return null;
    }

    const authorId = (createdBy as string).slice('cp:'.length);

    if (!authorId) {
      return null;
    }

    const cpUser: TCpUser | null =
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'cpUsers',
        method: 'query',
        action: 'get',
        input: { erxesCustomerId: authorId },
        defaultValue: null,
      })) ||
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'cpUsers',
        method: 'query',
        action: 'get',
        input: { id: authorId },
        defaultValue: null,
      }));

    if (!cpUser) {
      return { _id: authorId, fullName: '', email: '', avatar: '' };
    }

    return {
      _id: cpUser._id,
      fullName: buildFullName(cpUser),
      email: cpUser.email || '',
      avatar: cpUser.avatar || '',
    };
  },
};
