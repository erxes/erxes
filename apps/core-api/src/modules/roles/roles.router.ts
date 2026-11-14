import { db } from '@erxes/core-db';
import {
  createRole,
  listRoles,
  permissionCatalog,
  removeRole,
  updateRole,
} from '~/modules/roles/roles.service';
import { authed } from '~/orpc';

export const rolesRouter = {
  list: authed.roles.list.handler(() => listRoles(db())),
  permissions: authed.roles.permissions.handler(async () => ({
    data: await permissionCatalog(db()),
  })),
  create: authed.roles.create.handler(({ input, context }) => createRole(context.actor, input)),
  update: authed.roles.update.handler(({ input: { key, ...changes }, context }) =>
    updateRole(context.actor, key, changes),
  ),
  remove: authed.roles.remove.handler(({ input, context }) => removeRole(context.actor, input.key)),
};
