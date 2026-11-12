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
  list: authed.roles.list.handler(({ context }) => listRoles(db(), context.actor)),
  permissions: authed.roles.permissions.handler(async ({ context }) => ({
    data: await permissionCatalog(db(), context.actor.orgId),
  })),
  create: authed.roles.create.handler(({ input, context }) => createRole(context.actor, input)),
  update: authed.roles.update.handler(({ input: { key, ...changes }, context }) =>
    updateRole(context.actor, key, changes),
  ),
  remove: authed.roles.remove.handler(({ input, context }) => removeRole(context.actor, input.key)),
};
