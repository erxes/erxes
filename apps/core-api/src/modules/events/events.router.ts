import { db } from '@erxes/core-db';
import {
  dismissEventFailures,
  listEventFailures,
  listEvents,
  publishPluginEvents,
  retryEventFailures,
} from '~/modules/events/events.service';
import { scoped } from '~/orpc';

export const eventsRouter = {
  publish: scoped.events.publish.handler(({ input }) => publishPluginEvents(db(), input.events)),
  list: scoped.events.list.handler(({ input }) => listEvents(db(), input)),
  failures: scoped.events.failures.handler(({ input }) => listEventFailures(db(), input)),
  retryFailures: scoped.events.retryFailures.handler(({ input }) =>
    retryEventFailures(db(), input),
  ),
  dismissFailures: scoped.events.dismissFailures.handler(({ input }) =>
    dismissEventFailures(db(), input),
  ),
};
