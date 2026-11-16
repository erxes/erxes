import { db } from '@erxes/core-db';
import { resendInvitation } from '~/modules/auth/tokens.service';
import { inviteUser, inviteUsers } from '~/modules/users/invitations.service';
import {
  getUser,
  listUsers,
  manageMember,
  setUserDisabled,
  setUserPassword,
  updateUser,
} from '~/modules/users/users.service';
import { addMember, allowSignIn, stopSignIn } from '~/modules/users/withoutSignIn.service';
import { scoped } from '~/orpc';

export const usersRouter = {
  list: scoped.users.list.handler(({ input }) => listUsers(db(), input)),
  get: scoped.users.get.handler(({ input }) => getUser(db(), input.id)),
  invite: scoped.users.invite.handler(({ input }) => inviteUser(db(), input)),
  inviteMany: scoped.users.inviteMany.handler(({ input }) => inviteUsers(input.entries)),
  resendInvitation: scoped.users.resendInvitation.handler(({ input }) =>
    resendInvitation(db(), input.id),
  ),
  add: scoped.users.add.handler(({ input }) => addMember(db(), input)),
  allowSignIn: scoped.users.allowSignIn.handler(({ input }) =>
    manageMember(
      db(),
      input.id,
      { self: 'You already sign in', owner: 'Owners always sign in' },
      (target) => allowSignIn(target, input.email),
    ),
  ),
  stopSignIn: scoped.users.stopSignIn.handler(({ input }) =>
    manageMember(
      db(),
      input.id,
      {
        self: 'You cannot stop your own sign-in',
        owner: 'Only an owner can change an owner',
      },
      stopSignIn,
    ),
  ),
  update: scoped.users.update.handler(({ input: { id, ...changes } }) => updateUser(id, changes)),
  setPassword: scoped.users.setPassword.handler(({ input }) =>
    setUserPassword(input.id, input.password),
  ),
  disable: scoped.users.disable.handler(({ input }) => setUserDisabled(input.id, true)),
  enable: scoped.users.enable.handler(({ input }) => setUserDisabled(input.id, false)),
};
