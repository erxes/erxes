import { queueMessagingPush, dispatchMessagingPush } from './push';
import { messagingStorage } from './attachments';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { getMessagingApps, type MessagingApp } from './config';
import { messagingTopic } from './events';
import { generateMessagingModels, type MessagingModels } from './models';

const dispatchNextEvent = async (
  app: MessagingApp,
  models: MessagingModels,
): Promise<boolean> => {
  const scope = { tenant: app.tenant, appId: app.appId };
  const event = await models.Events.findOneAndUpdate(
    {
      ...scope,
      dispatchedAt: { $exists: false },
      leaseUntil: { $lte: new Date() },
    },
    { $set: { leaseUntil: new Date(Date.now() + 60_000) } },
    { new: true },
  ).lean();
  if (!event) return false;
  // A wake-up is only committed after its push outbox work and Redis publish.
  // Any failure leaves this event available after its lease expires.
  await queueMessagingPush(app, event);
  await graphqlPubsub.publish(
    messagingTopic(app.tenant, app.appId, event.memberId),
    { communicationMessagingWake: true },
  );
  await models.Events.updateOne(
    { ...scope, _id: event._id },
    { $set: { dispatchedAt: new Date() } },
  );
  return true;
};

export const dispatchMessagingEvents = async (app: MessagingApp) => {
  const models = await generateMessagingModels(app.tenant);
  await models.Events.init();
  await models.Deliveries.init();
  for (let count = 0; count < 100; count++) {
    if (!(await dispatchNextEvent(app, models))) break;
  }
};

const cleanupMessagingUploads = async (app: MessagingApp) => {
  if (!app.storage) return;
  const models = await generateMessagingModels(app.tenant);
  const scope = { tenant: app.tenant, appId: app.appId };
  const expired = await models.Attachments.find({
    ...scope,
    state: { $ne: 'BOUND' },
    expiresAt: { $lte: new Date() },
  })
    .limit(25)
    .lean();
  const bucket = app.storage.bucket;
  // Each object is independent. Wait for every bounded cleanup task before
  // releasing the poller's running guard, including when one deletion fails.
  const results = await Promise.allSettled(
    expired.map(async (attachment) => {
      await messagingStorage(app)
        .deleteObject({ Bucket: bucket, Key: attachment.objectKey })
        .promise();
      await models.Attachments.deleteOne({
        ...scope,
        _id: attachment._id,
        state: { $ne: 'BOUND' },
        expiresAt: { $lte: new Date() },
      });
    }),
  );
  const errors: unknown[] = results.flatMap((result) =>
    result.status === 'rejected' ? [result.reason] : [],
  );
  if (errors.length)
    throw new AggregateError(errors, 'Messaging upload cleanup failed');
};

export const startMessagingWorker = () => {
  for (const app of getMessagingApps()) {
    // Provider latency and upload cleanup must not hold up live wake-ups.
    for (const run of [
      dispatchMessagingEvents,
      dispatchMessagingPush,
      cleanupMessagingUploads,
    ]) {
      let running = false;
      const tick = async () => {
        if (running) return;
        running = true;
        try {
          await run(app);
        } catch {
          process.stderr.write(
            'Communication messaging ' +
              run.name +
              ' failed for ' +
              app.appId +
              '\n',
          );
        } finally {
          running = false;
        }
      };
      const timer = setInterval(() => {
        void tick();
      }, 1000);
      timer.unref();
    }
  }
};
