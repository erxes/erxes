import { db } from '@erxes/core-db';
import { audited, recordOf, scoped, unscoped } from '~/orpc';
import { createPortalKey, listPortalKeys, portalToken, removePortalKey } from './portalKeys';
import {
  attachPortal,
  createPortal,
  detachPortal,
  getPortal,
  listCustomerAccounts,
  listPortals,
  removePortal,
  savePortal,
  updatePortal,
} from './portals.service';

const ok = { ok: true as const };

const saved = (portal: { id: string; name: string; origins: string[] }) => ({
  ...recordOf('portal', 'saved', portal.id, portal),
  metadata: { origins: portal.origins },
});

export const portalsRouter = {
  list: scoped.portals.list.handler(() => listPortals(db())),
  get: scoped.portals.get.handler(({ input }) => getPortal(db(), input.id)),
  create: scoped.portals.create.handler(({ input }) =>
    audited((tx) => createPortal(tx, input), saved),
  ),
  update: scoped.portals.update.handler(({ input }) =>
    audited((tx) => updatePortal(tx, input), saved),
  ),
  remove: scoped.portals.remove.handler(({ input }) =>
    audited(
      (tx) => removePortal(tx, input.id),
      (portal) => recordOf('portal', 'deleted', portal.id, portal),
    ).then(() => ok),
  ),
  save: scoped.portals.save.handler(({ input }) => audited((tx) => savePortal(tx, input), saved)),
  attach: scoped.portals.attach.handler(({ input }) =>
    audited(
      (tx) => attachPortal(tx, input),
      (row) => ({
        ...recordOf('portal', 'plugin_attached', row.portalId),
        metadata: { plugin: row.plugin, recordId: row.recordId },
      }),
    ),
  ),
  detach: scoped.portals.detach.handler(({ input }) =>
    audited(
      (tx) => detachPortal(tx, input.recordId),
      (row) => ({
        ...recordOf('portal', 'plugin_detached', row.portalId),
        metadata: { plugin: row.plugin, recordId: row.recordId },
      }),
    ).then(() => ok),
  ),
  keys: scoped.portals.keys.handler(() => listPortalKeys(db())),
  createKey: scoped.portals.createKey.handler(({ input }) =>
    audited(
      (tx) => createPortalKey(tx, input),
      (key) => ({
        ...recordOf('portal_key', 'created', key.id, key),
        metadata: { portalId: key.portalId },
      }),
    ),
  ),
  removeKey: scoped.portals.removeKey.handler(({ input }) =>
    audited(
      (tx) => removePortalKey(tx, input),
      (key) => ({
        ...recordOf('portal_key', 'revoked', key.id, key),
        metadata: { portalId: input.id },
      }),
    ).then(() => ok),
  ),
};

export const portalAuthRouter = {
  token: unscoped.portalAuth.token.handler(({ input }) => portalToken(input.key)),
};

export const customerAccountsRouter = {
  list: scoped.customerAccounts.list.handler(({ input }) =>
    listCustomerAccounts(db(), input.customerId),
  ),
};
