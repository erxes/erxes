import { db, requestOrgId, withOrg } from '@erxes/core-db';
import { scoped, unscoped } from '~/orpc';
import { offerCandidates } from './connect';
import {
  openAccount,
  ownSetup,
  pluginAccounts,
  pluginUpdateAccount,
  reportAccount,
} from './pluginAccounts.service';

export const pluginAccountsRouter = {
  offer: unscoped.pluginAccounts.offer.handler(({ input }) => offerCandidates(input)),
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
