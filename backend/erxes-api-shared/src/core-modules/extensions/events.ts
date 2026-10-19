import { randomUUID } from 'node:crypto';
import { sendWorkerQueue } from '../../utils/mq-worker';
import { redis } from '../../utils/redis';
import { extensionTenant } from './tenant';

// The record event types installed extensions subscribe to, per tenant, as a
// JSON array. The extensions runtime writes it on every install change.
// Without a runtime the key is absent and no event is published.
export const extensionEventsKey = (tenant: string) =>
  `extensions:events:${tenant}`;

// The jobs the extensions runtime consumes, one per record.
export const EXTENSION_EVENTS_QUEUE = ['extensions', 'events'] as const;

type Diff = { added?: object; removed?: object; updated?: object };

// Hands one db event to the extensions runtime when some extension
// subscribes to its type (`sales:sales.deals.update`). Only ids and the
// names of the changed top-level fields go out, never the documents: a
// handler reads the record through erxes, which checks its permissions.
// Best effort: when this fails the event is lost, and the log says so.
export const teeExtensionEvent = async (
  subdomain: string,
  {
    type,
    ids,
    diff,
    userId,
  }: { type: string; ids: string[]; diff?: Diff; userId?: string },
) => {
  const tenant = extensionTenant(subdomain);
  const subscribed = await redis.get(extensionEventsKey(tenant));

  if (
    ids.length === 0 ||
    !subscribed ||
    !(JSON.parse(subscribed) as string[]).includes(type)
  ) {
    return;
  }

  const updatedFields = diff
    ? Object.keys({ ...diff.added, ...diff.removed, ...diff.updated })
    : undefined;

  await sendWorkerQueue(...EXTENSION_EVENTS_QUEUE).addBulk(
    ids.map((_id) => ({
      name: 'event',
      data: {
        tenant,
        eventId: randomUUID(),
        type,
        _id,
        ...(updatedFields && { updatedFields }),
        ...(userId && { userId }),
      },
      opts: { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
    })),
  );
};
