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
import { authed } from '~/orpc';

export const webhooksRouter = {
  eventTypes: authed.webhooks.eventTypes.handler(async () => ({
    data: await eventTypeCatalog(db()),
  })),
  list: authed.webhooks.list.handler(() => listWebhooks(db())),
  create: authed.webhooks.create.handler(({ input, context }) =>
    createWebhook(db(), context.actor, input),
  ),
  update: authed.webhooks.update.handler(({ input: { id, ...changes }, context }) =>
    updateWebhook(db(), context.actor, id, changes),
  ),
  remove: authed.webhooks.remove.handler(({ input, context }) =>
    removeWebhook(db(), context.actor, input.id),
  ),
  rotateSecret: authed.webhooks.rotateSecret.handler(({ input, context }) =>
    rotateWebhookSecret(db(), context.actor, input.id),
  ),
  test: authed.webhooks.test.handler(({ input, context }) =>
    testWebhook(db(), context.actor, input.id),
  ),
  deliveries: authed.webhooks.deliveries.handler(({ input }) => listDeliveries(db(), input)),
  redeliver: authed.webhooks.redeliver.handler(({ input, context }) =>
    redeliver(db(), context.actor, input.deliveryId),
  ),
};
