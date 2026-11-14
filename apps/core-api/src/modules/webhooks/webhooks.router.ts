import { db } from '@erxes/core-db';
import { listDeliveries, redeliver, testWebhook } from '~/modules/webhooks/webhookDelivery';
import {
  createWebhook,
  eventTypeCatalog,
  listWebhooks,
  removeWebhook,
  rotateWebhookSecret,
  updateWebhook,
} from '~/modules/webhooks/webhooks.service';
import { scoped } from '~/orpc';

export const webhooksRouter = {
  eventTypes: scoped.webhooks.eventTypes.handler(async () => ({
    data: await eventTypeCatalog(db()),
  })),
  list: scoped.webhooks.list.handler(() => listWebhooks(db())),
  create: scoped.webhooks.create.handler(({ input }) => createWebhook(db(), input)),
  update: scoped.webhooks.update.handler(({ input: { id, ...changes } }) =>
    updateWebhook(db(), id, changes),
  ),
  remove: scoped.webhooks.remove.handler(({ input }) => removeWebhook(db(), input.id)),
  rotateSecret: scoped.webhooks.rotateSecret.handler(({ input }) =>
    rotateWebhookSecret(db(), input.id),
  ),
  test: scoped.webhooks.test.handler(({ input }) => testWebhook(db(), input.id)),
  deliveries: scoped.webhooks.deliveries.handler(({ input }) => listDeliveries(db(), input)),
  redeliver: scoped.webhooks.redeliver.handler(({ input }) => redeliver(db(), input.deliveryId)),
};
