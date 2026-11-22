import { db } from '@erxes/core-db';
import {
  connect,
  integrationConnectionsOf,
  listIntegrations,
  removeConnection,
  updateConnection,
} from '~/modules/integrations/integrations.service';
import { reportIntegrationState } from '~/modules/integrations/pluginIntegrations';
import { appSubscriptionsOf } from '~/modules/integrations/listeners';
import { listAppRecords } from '~/modules/integrations/records';
import { authorizeUrl, removeOAuthApp, setOAuthApp } from '~/modules/integrations/oauth';
import { scoped, unscoped } from '~/orpc';

export const integrationsRouter = {
  list: scoped.integrations.list.handler(() => listIntegrations(db())),
  connections: scoped.integrations.connections.handler(({ input }) =>
    integrationConnectionsOf(db(), input.key),
  ),
  subscriptions: scoped.integrations.subscriptions.handler(({ input }) =>
    appSubscriptionsOf(db(), input.key),
  ),
  records: unscoped.integrations.records.handler(({ input }) => listAppRecords(input)),
  connect: unscoped.integrations.connect.handler(({ input }) => connect(input)),
  update: unscoped.integrations.update.handler(({ input }) => updateConnection(input)),
  remove: scoped.integrations.remove.handler(({ input }) =>
    removeConnection(db(), input.key, input.id),
  ),
  report: scoped.integrations.report.handler(({ input }) => reportIntegrationState(db(), input)),
  authorize: scoped.integrations.authorize.handler(({ input }) => authorizeUrl(db(), input)),
  setOAuthApp: scoped.integrations.setOAuthApp.handler(({ input }) => setOAuthApp(db(), input)),
  removeOAuthApp: scoped.integrations.removeOAuthApp.handler(({ input }) =>
    removeOAuthApp(db(), input.key),
  ),
};
