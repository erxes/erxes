import { db } from '@erxes/core-db';
import { audited, scoped, unscoped } from '~/orpc';
import {
  listConnections,
  removeConnection,
  saveConnection,
  setDefaultProvider,
} from './connections.service';
import { listModels, verifyModel } from './models.service';
import { getSettings, updateSettings } from './settings.service';
import { getThread, listThreads, removeThread, updateThread } from './threads.service';

export const assistantRouter = {
  connections: scoped.assistant.connections.handler(() => listConnections(db())),
  saveConnection: scoped.assistant.saveConnection.handler(({ input }) =>
    saveConnection(db(), input.provider, input.apiKey),
  ),
  removeConnection: scoped.assistant.removeConnection.handler(({ input }) =>
    removeConnection(db(), input.provider),
  ),
  setDefaultProvider: scoped.assistant.setDefaultProvider.handler(({ input }) =>
    setDefaultProvider(db(), input.provider),
  ),
  models: unscoped.assistant.models.handler(() => listModels()),
  verifyModel: unscoped.assistant.verifyModel.handler(({ input }) =>
    verifyModel(input.provider, input.model),
  ),
  threads: scoped.assistant.threads.handler(({ input }) => listThreads(db(), input)),
  thread: scoped.assistant.thread.handler(({ input }) => getThread(db(), input.id)),
  updateThread: scoped.assistant.updateThread.handler(({ input: { id, ...changes } }) =>
    updateThread(db(), id, changes),
  ),
  removeThread: scoped.assistant.removeThread.handler(({ input }) => removeThread(db(), input.id)),
  settings: scoped.assistant.settings.handler(() => getSettings(db())),
  updateSettings: scoped.assistant.updateSettings.handler(({ input }) =>
    audited(
      (tx) => updateSettings(tx, input.approvalMode),
      () => ({
        action: 'settings.assistant_approval_changed',
        targetType: 'organization',
        metadata: { approvalMode: input.approvalMode },
      }),
    ),
  ),
};
