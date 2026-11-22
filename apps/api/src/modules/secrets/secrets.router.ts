import { caller, db } from '@erxes/core-db';
import { scoped } from '~/orpc';
import { listHoldings } from './holdings.service';
import { readSecretAs, removeSecretAs, saveSecretAs } from './vault';

const owner = () => caller('plugin').plugin;

export const secretsRouter = {
  holdings: scoped.secrets.holdings.handler(() => listHoldings(db())),
  save: scoped.secrets.save.handler(async ({ input }) => ({
    id: await saveSecretAs(db(), owner(), input.value),
  })),
  replace: scoped.secrets.replace.handler(async ({ input }) => ({
    id: await saveSecretAs(db(), owner(), input.value, input.id),
  })),
  read: scoped.secrets.read.handler(async ({ input }) => ({
    value: await readSecretAs(db(), owner(), input.id),
  })),
  remove: scoped.secrets.remove.handler(({ input }) => removeSecretAs(db(), owner(), input.id)),
};
