import { db } from '@erxes/core-db';
import { createApiKey, listApiKeys, removeApiKey } from '~/modules/apiKeys/apiKeys.service';
import { scoped } from '~/orpc';

export const apiKeysRouter = {
  list: scoped.apiKeys.list.handler(() => listApiKeys(db())),
  create: scoped.apiKeys.create.handler(({ input }) => createApiKey(db(), input)),
  remove: scoped.apiKeys.remove.handler(({ input }) => removeApiKey(db(), input.id)),
};
