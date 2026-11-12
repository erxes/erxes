import { db } from '@erxes/core-db';
import {
  dismissEventFailures,
  listEventFailures,
  listEvents,
  publishPluginEvents,
  retryEventFailures,
} from '~/modules/events/events.service';
import { authed, plugin } from '~/orpc';

export const eventsRouter = {
  publish: plugin.events.publish.handler(({ input, context }) =>
    publishPluginEvents(db(), context.plugin, input.events),
  ),
  list: authed.events.list.handler(({ input, context }) => listEvents(db(), context.actor, input)),
  failures: authed.events.failures.handler(({ input, context }) =>
    listEventFailures(db(), context.actor, input),
  ),
  retryFailures: authed.events.retryFailures.handler(({ input, context }) =>
    retryEventFailures(db(), context.actor, input),
  ),
  dismissFailures: authed.events.dismissFailures.handler(({ input, context }) =>
    dismissEventFailures(db(), context.actor, input),
  ),
};
