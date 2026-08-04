import { markResolvers } from 'erxes-api-shared/utils';
import { adminMutations } from './admin';
import { authMutations } from './auth';
import { userMutations } from './user';

const ADMIN_CP_USER_KEYS = new Set([
  'cpUsersAdd',
  'cpUsersEdit',
  'cpUsersRemove',
  'cpUsersSetPassword',
]);

export const cpUserMutations = {
  ...adminMutations,
  ...authMutations,
  ...userMutations,
};

const clientPortalOnlyMutations = Object.fromEntries(
  Object.entries(cpUserMutations).filter(
    ([key]) => !ADMIN_CP_USER_KEYS.has(key),
  ),
);

markResolvers(clientPortalOnlyMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
