import { queueMessagingPush, dispatchMessagingPush } from './push';
import { messagingStorage } from './attachments';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { getMessagingApps, type MessagingApp } from './config';
import { messagingTopic } from './events';
import { generateMessagingModels } from './models';

export const dispatchMessagingEvents = async (app: MessagingApp) => {
  const models = await generateMessagingModels(app.tenant);
  const scope = { tenant: app.tenant, appId: app.appId };
  await models.Events.init();
  await models.Deliveries.init();
  for (let count = 0; count < 100; count++) {
    const event = await models.Events.findOneAndUpdate(
      {
        ...scope,
        dispatchedAt: { $exists: false },
        leaseUntil: { $lte: new Date() },
      },
      { $set: { leaseUntil: new Date(Date.now() + 60_000) } },
      { new: true },
    ).lean();
    if (!event) break;
    await queueMessagingPush(app, event);
    await graphqlPubsub.publish(
      messagingTopic(app.tenant, app.appId, event.memberId),
      { frontlineMessagingWake: true },
    );
    await models.Events.updateOne(
      { ...scope, _id: event._id },
      { $set: { dispatchedAt: new Date() } },
    );
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
  for (const attachment of expired) {
    await messagingStorage(app)
      .deleteObject({ Bucket: app.storage.bucket, Key: attachment.objectKey })
      .promise();
    await models.Attachments.deleteOne({
      ...scope,
      _id: attachment._id,
      state: { $ne: 'BOUND' },
      expiresAt: { $lte: new Date() },
    });
  }
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
            'Frontline messaging ' +
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
