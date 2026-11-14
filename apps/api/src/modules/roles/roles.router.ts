import { db } from '@erxes/core-db';
import {
  createRole,
  listRoles,
  permissionCatalog,
  permissionSets,
  removeRole,
  updateRole,
} from '~/modules/roles/roles.service';
import { scoped } from '~/orpc';

export const rolesRouter = {
  list: scoped.roles.list.handler(() => listRoles(db())),
  permissions: scoped.roles.permissions.handler(async () => ({
    data: await permissionCatalog(db()),
  })),
  permissionSets: scoped.roles.permissionSets.handler(async () => ({
    data: await permissionSets(db()),
  })),
  create: scoped.roles.create.handler(({ input }) => createRole(input)),
  update: scoped.roles.update.handler(({ input: { key, ...changes } }) => updateRole(key, changes)),
  remove: scoped.roles.remove.handler(({ input }) => removeRole(input.key)),
};
