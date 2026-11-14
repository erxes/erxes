import { db } from '@erxes/core-db';
import { resendInvitation } from '~/modules/auth/tokens.service';
import { inviteUser, inviteUsers } from '~/modules/users/invitations.service';
import {
  getUser,
  listUsers,
  setUserDisabled,
  setUserPassword,
  updateUser,
} from '~/modules/users/users.service';
import { scoped } from '~/orpc';

export const usersRouter = {
  list: scoped.users.list.handler(({ input }) => listUsers(db(), input)),
  get: scoped.users.get.handler(({ input }) => getUser(db(), input.id)),
  invite: scoped.users.invite.handler(({ input }) => inviteUser(db(), input)),
  inviteMany: scoped.users.inviteMany.handler(({ input }) => inviteUsers(input.entries)),
  resendInvitation: scoped.users.resendInvitation.handler(({ input }) =>
    resendInvitation(db(), input.id),
  ),
  update: scoped.users.update.handler(({ input: { id, ...changes } }) => updateUser(id, changes)),
  setPassword: scoped.users.setPassword.handler(({ input }) =>
    setUserPassword(input.id, input.password),
  ),
  disable: scoped.users.disable.handler(({ input }) => setUserDisabled(input.id, true)),
  enable: scoped.users.enable.handler(({ input }) => setUserDisabled(input.id, false)),
};
