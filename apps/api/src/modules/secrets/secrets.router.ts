import { db } from '@erxes/core-db';
import {
  listPluginSecrets,
  markPluginSecret,
  readPluginSecret,
  removePluginSecret,
  replacePluginSecret,
  savePluginSecret,
} from '~/modules/integrations/pluginIntegrations';
import { scoped } from '~/orpc';
import { listHoldings } from './holdings.service';

export const secretsRouter = {
  holdings: scoped.secrets.holdings.handler(() => listHoldings(db())),
  save: scoped.secrets.save.handler(({ input }) => savePluginSecret(db(), input)),
  list: scoped.secrets.list.handler(({ input }) => listPluginSecrets(db(), input.key)),
  read: scoped.secrets.read.handler(({ input }) => readPluginSecret(db(), input.id)),
  replace: scoped.secrets.replace.handler(({ input }) => replacePluginSecret(db(), input)),
  mark: scoped.secrets.mark.handler(({ input }) => markPluginSecret(db(), input)),
  remove: scoped.secrets.remove.handler(({ input }) => removePluginSecret(db(), input.id)),
};
