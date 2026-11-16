import { db } from '@erxes/core-db';
import { audited, recordOf, scoped } from '~/orpc';
import { estimateAudience } from './audience';
import {
  createBroadcast,
  duplicateBroadcast,
  getBroadcast,
  listBroadcasts,
  removeBroadcast,
  updateBroadcast,
} from './broadcasts.service';
import { previewBroadcast, testBroadcast } from './copies';
import { addSuppressions, listRecipients, listSuppressions, removeSuppression } from './lists';
import {
  cancelBroadcast,
  pauseBroadcast,
  resumeBroadcast,
  scheduleBroadcast,
  sendBroadcast,
  unscheduleBroadcast,
} from './sending';

const entry = (action: string) => (broadcast: { id: string; name: string }) =>
  recordOf('broadcast', action, broadcast.id, broadcast);

export const broadcastsRouter = {
  list: scoped.broadcasts.list.handler(({ input }) => listBroadcasts(db(), input)),
  get: scoped.broadcasts.get.handler(({ input }) => getBroadcast(db(), input.id)),
  recipients: scoped.broadcasts.recipients.handler(({ input }) => listRecipients(db(), input)),
  audience: scoped.broadcasts.audience.handler(({ input: { channel, ...audience } }) =>
    estimateAudience(db(), channel, audience),
  ),
  preview: scoped.broadcasts.preview.handler(({ input }) =>
    previewBroadcast(db(), input.id, input.customerId),
  ),
  create: scoped.broadcasts.create.handler(({ input }) =>
    audited((tx) => createBroadcast(tx, input), entry('created')),
  ),
  update: scoped.broadcasts.update.handler(({ input: { id, ...changes } }) =>
    audited((tx) => updateBroadcast(tx, id, changes), entry('updated')),
  ),
  remove: scoped.broadcasts.remove.handler(({ input }) =>
    audited(
      (tx) => removeBroadcast(tx, input.id),
      (removed) => recordOf('broadcast', 'deleted', input.id, removed),
    ).then(() => ({ ok: true as const })),
  ),
  duplicate: scoped.broadcasts.duplicate.handler(({ input }) =>
    audited((tx) => duplicateBroadcast(tx, input.id), entry('created')),
  ),
  test: scoped.broadcasts.test.handler(({ input }) =>
    audited(
      (tx) => testBroadcast(tx, input.id, input.to),
      () => ({ ...recordOf('broadcast', 'tested', input.id), metadata: { to: input.to } }),
    ),
  ),
  send: scoped.broadcasts.send.handler(({ input }) =>
    audited((tx) => sendBroadcast(tx, input.id), entry('sent')),
  ),
  schedule: scoped.broadcasts.schedule.handler(({ input }) =>
    audited(
      (tx) => scheduleBroadcast(tx, input.id, new Date(input.at)),
      (broadcast) => ({ ...entry('scheduled')(broadcast), metadata: { at: input.at } }),
    ),
  ),
  unschedule: scoped.broadcasts.unschedule.handler(({ input }) =>
    audited((tx) => unscheduleBroadcast(tx, input.id), entry('unscheduled')),
  ),
  pause: scoped.broadcasts.pause.handler(({ input }) =>
    audited((tx) => pauseBroadcast(tx, input.id), entry('paused')),
  ),
  resume: scoped.broadcasts.resume.handler(({ input }) =>
    audited((tx) => resumeBroadcast(tx, input.id), entry('resumed')),
  ),
  cancel: scoped.broadcasts.cancel.handler(({ input }) =>
    audited((tx) => cancelBroadcast(tx, input.id), entry('cancelled')),
  ),
};

export const suppressionsRouter = {
  list: scoped.suppressions.list.handler(({ input }) => listSuppressions(db(), input)),
  add: scoped.suppressions.add.handler(({ input }) =>
    audited(
      (tx) => addSuppressions(tx, input),
      (result) => ({
        action: 'suppression.added',
        targetType: 'suppression',
        targetLabel: input.channel,
        metadata: { addresses: result.addresses },
      }),
    ).then(({ added }) => ({ added })),
  ),
  remove: scoped.suppressions.remove.handler(({ input }) =>
    audited(
      (tx) => removeSuppression(tx, input.id),
      (removed) => ({
        ...recordOf('suppression', 'removed', input.id),
        targetLabel: removed.address,
        metadata: { reason: removed.reason },
      }),
    ).then(() => ({ ok: true as const })),
  ),
};
