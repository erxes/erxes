import { db } from '@erxes/core-db';
import { requirePermission } from '~/http/auth';
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
import { authed, plugin, authedUnscoped } from '~/orpc';

export const auditRouter = {
  list: authed.audit.list.handler(({ input, context }) => listAudit(db(), context.actor, input)),
  record: plugin.audit.record.handler(({ input, context }) =>
    recordPluginAudit(db(), context.plugin, input.entries),
  ),
  verify: authed.audit.verify.handler(({ context }) => verifyAudit(db(), context.actor)),
  checkpoints: authed.audit.checkpoints.handler(({ input, context }) => {
    requirePermission(context.actor, 'audit.view');

    return listCheckpoints(db(), context.actor.orgId, input);
  }),
  settings: authed.audit.settings.handler(({ context }) =>
    auditSettings(db(), context.actor.orgId),
  ),
  updateSettings: authed.audit.updateSettings.handler(({ input, context }) =>
    updateAuditSettings(db(), context.actor, input),
  ),
  streams: authed.audit.streams.handler(({ context }) => listStreams(db(), context.actor)),
  createStream: authed.audit.createStream.handler(({ input, context }) =>
    createStream(db(), context.actor, input),
  ),
  updateStream: authed.audit.updateStream.handler(({ input: { id, ...changes }, context }) =>
    updateStream(db(), context.actor, id, changes),
  ),
  removeStream: authed.audit.removeStream.handler(({ input, context }) =>
    removeStream(db(), context.actor, input.id),
  ),
  testStream: authedUnscoped.audit.testStream.handler(({ input, context }) =>
    testStream(context.actor, input.id),
  ),
};
