import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

// Ways a support visit could outlast its grant or widen itself; denied whatever its groups allow
export const DENIED_DURING_SUPPORT = new Set([
  'teamMembersInvite',
  'teamMembersUpdate',
  'teamMembersResetPassword',
  'teamMembersRemove',
  'permissionsManage',
  'appsManage',
  'manageAgentsSettings',
]);

type CheckPermission = (action: string, ownerId?: string) => Promise<void>;

/** Wraps the request's permission check so a support user never passes the denied actions. */
export const guardSupportPermissions = (
  models: IModels,
  user: IUserDocument | undefined,
  checkPermission: CheckPermission,
): CheckPermission => {
  let isSupportUser: Promise<boolean> | undefined;

  return async (action, ownerId) => {
    if (user?._id && DENIED_DURING_SUPPORT.has(action)) {
      // Asked once per request and only for a denied action, so other checks cost nothing
      isSupportUser ??= models.Users.isSupportUser(user._id);

      if (await isSupportUser) {
        throw new ExpectedError(
          'Not available during support access',
          'FORBIDDEN',
        );
      }
    }

    return checkPermission(action, ownerId);
  };
};
