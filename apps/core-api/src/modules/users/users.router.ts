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
import { authed } from '~/orpc';

export const usersRouter = {
  list: authed.users.list.handler(({ input }) => listUsers(db(), input)),
  get: authed.users.get.handler(({ input }) => getUser(db(), input.id)),
  invite: authed.users.invite.handler(({ input, context }) =>
    inviteUser(db(), context.actor, input),
  ),
  inviteMany: authed.users.inviteMany.handler(({ input, context }) =>
    inviteUsers(context.actor, input.entries),
  ),
  resendInvitation: authed.users.resendInvitation.handler(({ input, context }) =>
    resendInvitation(db(), context.actor, input.id),
  ),
  update: authed.users.update.handler(({ input: { id, ...changes }, context }) =>
    updateUser(context.actor, id, changes),
  ),
  setPassword: authed.users.setPassword.handler(({ input, context }) =>
    setUserPassword(context.actor, input.id, input.password),
  ),
  disable: authed.users.disable.handler(({ input, context }) =>
    setUserDisabled(context.actor, input.id, true),
  ),
  enable: authed.users.enable.handler(({ input, context }) =>
    setUserDisabled(context.actor, input.id, false),
  ),
};
