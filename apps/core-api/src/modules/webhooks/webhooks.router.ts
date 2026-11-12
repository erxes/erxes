import { db } from '@erxes/core-db';
import {
  createWebhook,
  eventTypeCatalog,
  listDeliveries,
  listWebhooks,
  redeliver,
  removeWebhook,
  rotateWebhookSecret,
  testWebhook,
  updateWebhook,
} from '~/modules/webhooks/webhooks.service';
import { authed } from '~/orpc';

export const webhooksRouter = {
  eventTypes: authed.webhooks.eventTypes.handler(async ({ context }) => ({
    data: await eventTypeCatalog(db(), context.actor.orgId),
  })),
  list: authed.webhooks.list.handler(({ context }) => listWebhooks(db(), context.actor)),
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
  deliveries: authed.webhooks.deliveries.handler(({ input, context }) =>
    listDeliveries(db(), context.actor, input),
  ),
  redeliver: authed.webhooks.redeliver.handler(({ input, context }) =>
    redeliver(db(), context.actor, input.deliveryId),
  ),
};
