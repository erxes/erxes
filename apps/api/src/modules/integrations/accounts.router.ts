import { db } from '@erxes/core-db';
import { audited, recordOf, scoped, unscoped } from '~/orpc';
import { checkAccount, removeAccount } from './accountChecks';
import {
  accountChoices,
  accountUsage,
  createCustomAccount,
  listAccounts,
  renameAccount,
  setCustomSecrets,
} from './accounts.service';
import { cancelPick, confirmPick, connectWithForm, getPick, startConnect } from './connect';
import { listDefinitions } from './definitionList';
import { getSetup, removeSetup, saveSetup } from './setups.service';

export const integrationAccountsRouter = {
  definitions: scoped.integrationAccounts.definitions.handler(() => listDefinitions(db())),
  list: scoped.integrationAccounts.list.handler(({ input }) =>
    listAccounts(db(), input.integration),
  ),
  choices: scoped.integrationAccounts.choices.handler(({ input }) =>
    accountChoices(db(), input.integration, input.kind),
  ),
  start: unscoped.integrationAccounts.start.handler(({ input }) => startConnect(input.integration)),
  connect: unscoped.integrationAccounts.connect.handler(({ input }) =>
    connectWithForm(input.integration, input.values),
  ),
  create: scoped.integrationAccounts.create.handler(({ input }) =>
    audited(
      (tx) => createCustomAccount(tx, input),
      (account) => ({
        ...recordOf('integration_account', 'connected', account.id, account),
        metadata: { integration: account.integration, names: account.sealedNames },
      }),
    ),
  ),
  setSecrets: scoped.integrationAccounts.setSecrets.handler(({ input }) =>
    audited(
      (tx) => setCustomSecrets(tx, input.id, input.secrets),
      (account) => ({
        ...recordOf('integration_account', 'secrets_changed', input.id, account),
        metadata: { names: Object.keys(input.secrets) },
      }),
    ),
  ),
  pick: scoped.integrationAccounts.pick.handler(({ input }) => getPick(db(), input.id)),
  confirmPick: unscoped.integrationAccounts.confirmPick.handler(({ input }) =>
    confirmPick(input.id, input.chosen),
  ),
  cancelPick: scoped.integrationAccounts.cancelPick.handler(({ input }) =>
    cancelPick(db(), input.id),
  ),
  rename: scoped.integrationAccounts.rename.handler(({ input }) =>
    audited(
      (tx) => renameAccount(tx, input.id, input.name),
      (account) => recordOf('integration_account', 'renamed', input.id, account),
    ),
  ),
  check: unscoped.integrationAccounts.check.handler(({ input }) => checkAccount(input.id)),
  usage: scoped.integrationAccounts.usage.handler(({ input }) => accountUsage(db(), input.id)),
  remove: unscoped.integrationAccounts.remove.handler(({ input }) => removeAccount(input.id)),
  setup: scoped.integrationAccounts.setup.handler(({ input }) => getSetup(db(), input.integration)),
  saveSetup: scoped.integrationAccounts.saveSetup.handler(({ input }) =>
    audited(
      (tx) => saveSetup(tx, input.integration, input.values),
      (setup) => ({
        action: 'integration_setup.saved',
        targetType: 'integration_setup',
        targetId: setup.integration,
        targetLabel: setup.integration,
        metadata: { names: Object.keys(input.values) },
      }),
    ),
  ),
  removeSetup: scoped.integrationAccounts.removeSetup.handler(({ input }) =>
    audited(
      (tx) => removeSetup(tx, input.integration),
      () => ({
        action: 'integration_setup.removed',
        targetType: 'integration_setup',
        targetId: input.integration,
        targetLabel: input.integration,
      }),
    ),
  ),
};
