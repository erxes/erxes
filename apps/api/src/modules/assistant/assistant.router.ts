import { db } from '@erxes/core-db';
import { audited, scoped, unscoped } from '~/orpc';
import { getAppearance, updateAppearance } from './appearance.service';
import { deleteThread, sendMessage, stopThread, watchThread } from './chat.service';
import { listModels, listProviders } from './models.service';
import { readRecord, UNAVAILABLE } from './records';
import { findReference } from './references.service';
import { getSettings, updateSettings } from './settings.service';
import { findThread, listThreads, updateThread } from './threads.service';

export const assistantRouter = {
  providers: scoped.assistant.providers.handler(() => listProviders(db())),
  models: unscoped.assistant.models.handler(() => listModels()),
  threads: scoped.assistant.threads.handler(({ input }) => listThreads(db(), input)),
  thread: scoped.assistant.thread.handler(({ input }) => findThread(db(), input.id)),
  send: unscoped.assistant.send.handler(({ input }) => sendMessage(input)),
  watch: unscoped.assistant.watch.handler(({ input, signal, context }) => {
    // An event stream: the web image's nginx would buffer it under /core/ (apps/web/deploy).
    context.res?.setHeader('X-Accel-Buffering', 'no');

    return watchThread(input.id, signal ?? AbortSignal.any([]));
  }),
  updateThread: scoped.assistant.updateThread.handler(({ input: { id, ...changes } }) =>
    updateThread(db(), id, changes),
  ),
  stopThread: scoped.assistant.stopThread.handler(({ input }) => stopThread(db(), input.id)),
  removeThread: scoped.assistant.removeThread.handler(({ input }) => deleteThread(db(), input.id)),
  reference: scoped.assistant.reference.handler(async ({ input }) => {
    const found = await findReference(db(), input.handle);

    return found ? readRecord(found.type, found.id) : UNAVAILABLE;
  }),
  record: scoped.assistant.record.handler(({ input }) => readRecord(input.type, input.id)),
  appearance: scoped.assistant.appearance.handler(() => getAppearance(db())),
  updateAppearance: scoped.assistant.updateAppearance.handler(({ input }) =>
    updateAppearance(db(), input),
  ),
  settings: scoped.assistant.settings.handler(() => getSettings(db())),
  updateSettings: scoped.assistant.updateSettings.handler(({ input }) =>
    audited(
      (tx) => updateSettings(tx, input),
      () => [
        ...(input.codeMode === undefined
          ? []
          : [
              {
                action: 'settings.assistant_code_mode_changed',
                targetType: 'organization',
                metadata: { codeMode: input.codeMode },
              },
            ]),
        ...(input.defaultProvider === undefined
          ? []
          : [
              {
                action: 'settings.assistant_default_model_changed',
                targetType: 'organization',
                metadata: { provider: input.defaultProvider, model: input.defaultModel },
              },
            ]),
      ],
    ),
  ),
};
