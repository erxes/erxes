import { db } from '@erxes/core-db';
import {
  connect,
  integrationConnectionsOf,
  listIntegrations,
  removeConnection,
  updateConnection,
} from '~/modules/integrations/integrations.service';
import { scoped, unscoped } from '~/orpc';

export const integrationsRouter = {
  list: scoped.integrations.list.handler(() => listIntegrations(db())),
  connections: scoped.integrations.connections.handler(({ input }) =>
    integrationConnectionsOf(db(), input.key),
  ),
  connect: unscoped.integrations.connect.handler(({ input }) => connect(input)),
  update: unscoped.integrations.update.handler(({ input }) => updateConnection(input)),
  remove: scoped.integrations.remove.handler(({ input }) =>
    removeConnection(db(), input.key, input.id),
  ),
};
