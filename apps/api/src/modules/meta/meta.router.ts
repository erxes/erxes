import { db, requestOrgId, withOrg } from '@erxes/core-db';
import { recordAudit } from '~/modules/audit/audit.service';
import { audited, scoped, unscoped } from '~/orpc';
import { appSettings, removeApp, saveApp } from './app.service';
import { checkConnection, listConnections, removeConnection } from './connections.service';
import { loginUrl } from './login';
import { guardedGraph, importMeta } from './pluginApi';
import { unrouteFromRelay } from './relay';
import { sendOnce } from './send';

export const metaRouter = {
  app: scoped.meta.app.handler(() => appSettings(db())),
  saveApp: scoped.meta.saveApp.handler(({ input }) =>
    audited(
      (tx) => saveApp(tx, input),
      () => ({
        action: 'meta.app_saved',
        targetType: 'meta_app',
        metadata: { appId: input.appId, secretChanged: input.appSecret !== undefined },
      }),
    ),
  ),
  removeApp: scoped.meta.removeApp.handler(() =>
    audited(
      (tx) => removeApp(tx),
      () => ({ action: 'meta.app_removed', targetType: 'meta_app' }),
    ),
  ),
  loginUrl: scoped.meta.loginUrl.handler(() => loginUrl(db(), requestOrgId())),
  connections: scoped.meta.connections.handler(async ({ input }) => ({
    data: await listConnections(db(), input.kind),
  })),
  repair: unscoped.meta.repair.handler(({ input }) =>
    checkConnection(requestOrgId(), input.id, true),
  ),
  disconnect: unscoped.meta.disconnect.handler(async ({ input, context }) => {
    const row = await withOrg(requestOrgId(), async (tx) => {
      const removed = await removeConnection(tx, input.id);

      await recordAudit(tx, {
        action: 'meta.disconnected',
        targetType: 'meta_connection',
        targetId: removed.id,
        targetLabel: removed.name,
        metadata: { kind: removed.kind, externalId: removed.externalId },
      });

      return removed;
    });

    if (row.app === 'install')
      await unrouteFromRelay(row.kind, row.externalId).catch((error: unknown) => {
        context.log.warn({ err: error, connectionId: row.id }, 'Meta relay route not removed');
      });

    return { ok: true as const };
  }),
  send: unscoped.meta.send.handler(({ input }) => sendOnce(requestOrgId(), input)),
  graph: unscoped.meta.graph.handler(({ input }) => guardedGraph(requestOrgId(), input)),
  import: scoped.meta.import.handler(({ input }) =>
    audited(
      (tx) => importMeta(tx, input),
      (result) => ({ action: 'meta.imported', targetType: 'meta_connection', metadata: result }),
    ),
  ),
};
