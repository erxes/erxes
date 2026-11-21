import { db, requestOrgId, withOrg } from '@erxes/core-db';
import { scoped, unscoped } from '~/orpc';
import { offerCandidates } from './connect';
import {
  importAccounts,
  openAccount,
  ownSetup,
  pluginAccounts,
  pluginUpdateAccount,
  reportAccount,
} from './pluginAccounts.service';
import { openPluginValues, sealPluginValues } from './vault';

export const pluginAccountsRouter = {
  offer: unscoped.pluginAccounts.offer.handler(({ input }) => offerCandidates(input)),
  import: scoped.pluginAccounts.import.handler(({ input }) => importAccounts(db(), input)),
  list: scoped.pluginAccounts.list.handler(({ input }) =>
    pluginAccounts(db(), input.integration, input.kind),
  ),
  open: scoped.pluginAccounts.open.handler(({ input }) => openAccount(db(), input.id)),
  update: scoped.pluginAccounts.update.handler(({ input: { id, ...changes } }) =>
    pluginUpdateAccount(db(), id, changes),
  ),
  report: scoped.pluginAccounts.report.handler(({ input }) =>
    reportAccount(db(), input.id, input.error),
  ),
  setup: unscoped.pluginAccounts.setup.handler(({ input }) =>
    withOrg(requestOrgId(), (tx) => ownSetup(tx, input.integration)),
  ),
};

export const pluginSecretsRouter = {
  seal: unscoped.pluginSecrets.seal.handler(({ input }) => sealPluginValues(input.values)),
  open: unscoped.pluginSecrets.open.handler(({ input }) => openPluginValues(input.sealed)),
};
