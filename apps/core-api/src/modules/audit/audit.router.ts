import { db } from '@erxes/core-db';
import { listCheckpoints } from '~/modules/audit/checkpoints';
import {
  auditSettings,
  listAudit,
  recordPluginAudit,
  updateAuditSettings,
  verifyAudit,
} from '~/modules/audit/audit.service';
import {
  createStream,
  listStreams,
  removeStream,
  testStream,
  updateStream,
} from '~/modules/audit/streams';
import { scoped, unscoped } from '~/orpc';

export const auditRouter = {
  list: scoped.audit.list.handler(({ input }) => listAudit(db(), input)),
  record: scoped.audit.record.handler(({ input }) => recordPluginAudit(db(), input.entries)),
  verify: scoped.audit.verify.handler(() => verifyAudit(db())),
  checkpoints: scoped.audit.checkpoints.handler(({ input }) => listCheckpoints(db(), input)),
  settings: scoped.audit.settings.handler(() => auditSettings(db())),
  updateSettings: scoped.audit.updateSettings.handler(({ input }) =>
    updateAuditSettings(db(), input),
  ),
  streams: scoped.audit.streams.handler(() => listStreams(db())),
  createStream: scoped.audit.createStream.handler(({ input }) => createStream(db(), input)),
  updateStream: scoped.audit.updateStream.handler(({ input: { id, ...changes } }) =>
    updateStream(db(), id, changes),
  ),
  removeStream: scoped.audit.removeStream.handler(({ input }) => removeStream(db(), input.id)),
  testStream: unscoped.audit.testStream.handler(({ input }) => testStream(input.id)),
};
