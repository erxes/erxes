import { db } from '@erxes/core-db';
import {
  createApiKey,
  listApiKeys,
  removeApiKey,
  updateApiKey,
} from '~/modules/apiKeys/apiKeys.service';
import { keyCalls, tryKey } from '~/modules/apiKeys/keyTry';
import { scoped } from '~/orpc';

export const apiKeysRouter = {
  list: scoped.apiKeys.list.handler(() => listApiKeys(db())),
  create: scoped.apiKeys.create.handler(({ input }) => createApiKey(db(), input)),
  update: scoped.apiKeys.update.handler(({ input: { id, ...changes } }) =>
    updateApiKey(db(), id, changes),
  ),
  remove: scoped.apiKeys.remove.handler(({ input }) => removeApiKey(db(), input.id)),
  calls: scoped.apiKeys.calls.handler(() => keyCalls()),
  try: scoped.apiKeys.try.handler(({ input }) => tryKey(db(), input)),
};
